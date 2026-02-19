"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/imageCompression";
import { uploadPhoto } from "@/services/upload.service";
import {
  ACCEPTED_IMAGE_TYPES,
  type AcceptedImageType,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/types/upload";

type PhotoUploadProps = {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Photo upload failed. Please try again.";
}

function getCameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Camera permission denied. Please allow camera access and retry.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "No camera found on this device.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "Camera is already in use by another app.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to access camera. Use HTTPS or localhost and try again.";
}

function isAcceptedType(type: string): type is AcceptedImageType {
  return ACCEPTED_IMAGE_TYPES.includes(type as AcceptedImageType);
}

function validateFile(file: File): void {
  const fileType = file.type.trim().toLowerCase();

  if (!fileType || !isAcceptedType(fileType)) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image size must be 2MB or less.");
  }
}

function captureFrame(videoElement: HTMLVideoElement): Promise<File> {
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;

  if (!width || !height) {
    return Promise.reject(new Error("Camera is still loading. Please wait a moment."));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.reject(new Error("Camera capture is not supported on this device."));
  }

  context.drawImage(videoElement, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to capture image. Please try again."));
          return;
        }

        resolve(
          new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      0.92,
    );
  });
}

export default function PhotoUpload({
  value,
  error,
  disabled = false,
  onChange,
  onUploadingChange,
}: PhotoUploadProps) {
  const [localError, setLocalError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lastCapturedFile, setLastCapturedFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isPreviewError, setIsPreviewError] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef("");
  const uploadControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const clearPreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    setPreviewUrl("");
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const setUploadingState = useCallback(
    (uploading: boolean) => {
      setIsUploading(uploading);
      onUploadingChange?.(uploading);
    },
    [onUploadingChange],
  );

  const abortActiveUpload = useCallback(() => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
    }
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLastCapturedFile(file);
      setLocalError("");
      setIsUploaded(false);
      setIsPreviewError(false);
      onChange("");

      abortActiveUpload();
      setUploadingState(true);

      try {
        validateFile(file);

        const compressedFile = await compressImage(file);
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (compressedFile.size > MAX_UPLOAD_SIZE_BYTES) {
          throw new Error("Compressed image is still above 2MB. Please capture again.");
        }

        clearPreview();
        const nextPreviewUrl = URL.createObjectURL(compressedFile);
        objectUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
        setIsPreviewError(false);

        const controller = new AbortController();
        uploadControllerRef.current = controller;

        const uploadedUrl = await uploadPhoto(compressedFile, {
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsUploaded(true);
        setLocalError("");
        onChange(uploadedUrl);
      } catch (uploadError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (uploadError instanceof DOMException && uploadError.name === "AbortError") {
          return;
        }

        setLocalError(getErrorMessage(uploadError));
        setIsUploaded(false);
        onChange("");
      } finally {
        if (requestId === requestIdRef.current) {
          setUploadingState(false);
          uploadControllerRef.current = null;
        }
      }
    },
    [abortActiveUpload, clearPreview, onChange, setUploadingState],
  );

  const openCamera = useCallback(async () => {
    if (disabled || isUploading || isCameraStarting) {
      return;
    }

    setLocalError("");
    setIsCameraOpen(true);
    setIsCameraStarting(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is unavailable in this browser.");
      }

      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
    } catch (cameraError) {
      stopCamera();
      setIsCameraOpen(false);
      setLocalError(getCameraErrorMessage(cameraError));
    } finally {
      setIsCameraStarting(false);
    }
  }, [disabled, isCameraStarting, isUploading, stopCamera]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
    stopCamera();
  }, [stopCamera]);

  const captureFromCamera = useCallback(async () => {
    if (disabled || isUploading) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      setLocalError("Camera is not ready.");
      return;
    }

    try {
      const capturedFile = await captureFrame(videoElement);
      closeCamera();
      await processFile(capturedFile);
    } catch (captureError) {
      setLocalError(getErrorMessage(captureError));
    }
  }, [closeCamera, disabled, isUploading, processFile]);

  const handleRetryUpload = useCallback(() => {
    if (!lastCapturedFile || disabled) {
      return;
    }

    void processFile(lastCapturedFile);
  }, [disabled, lastCapturedFile, processFile]);

  const handleRemove = useCallback(() => {
    requestIdRef.current += 1;
    abortActiveUpload();
    closeCamera();
    clearPreview();
    setLastCapturedFile(null);
    setLocalError("");
    setIsUploaded(false);
    setIsPreviewError(false);
    setUploadingState(false);
    onChange("");
  }, [abortActiveUpload, clearPreview, closeCamera, onChange, setUploadingState]);

  useEffect(() => {
    if (!value) {
      setIsUploaded(false);
      return;
    }

    setIsUploaded(true);
  }, [value]);

  useEffect(() => {
    setIsPreviewError(false);
  }, [previewUrl, value]);

  useEffect(() => {
    if (!isCameraOpen) {
      return;
    }

    const videoElement = videoRef.current;
    const stream = streamRef.current;

    if (!videoElement || !stream) {
      return;
    }

    videoElement.srcObject = stream;
    void videoElement.play();
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortActiveUpload();
      stopCamera();
      clearPreview();
      onUploadingChange?.(false);
    };
  }, [abortActiveUpload, clearPreview, onUploadingChange, stopCamera]);

  const displayError = localError || error;
  const previewSource = previewUrl || value;

  return (
    <div className="w-full space-y-3 md:max-w-[400px]">
      {!previewSource ? (
        <div className="space-y-3">
          {isCameraOpen ? (
            <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
              <div className="relative overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  className="h-56 w-full object-cover md:h-52"
                  playsInline
                  autoPlay
                  muted
                />
                {isCameraStarting ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      Opening camera...
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void captureFromCamera()}
                  disabled={disabled || isUploading || isCameraStarting}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  disabled={disabled || isUploading}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void openCamera()}
              disabled={disabled || isUploading}
              className="group flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center shadow-sm transition hover:border-blue-500 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-70 md:min-h-48"
            >
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M4 8h2l1.5-2h9L18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </span>

              <p className="text-sm font-semibold text-gray-900">Capture customer photo</p>
              <p className="mt-1 text-xs text-gray-500">Camera only, image up to 2MB</p>

              {isUploading ? (
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  Uploading...
                </span>
              ) : (
                <span className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition group-hover:bg-blue-700">
                  Open Camera
                </span>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
          <div className="relative h-52 overflow-hidden rounded-lg bg-gray-100">
            {isPreviewError ? (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                Preview unavailable
              </div>
            ) : (
              <Image
                src={previewSource}
                alt="Customer preview"
                width={480}
                height={320}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 400px"
                unoptimized
                onError={() => setIsPreviewError(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              {isUploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Uploading...</span>
                </>
              ) : isUploaded ? (
                <>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      aria-hidden="true"
                    >
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-green-700">Uploaded successfully</span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void openCamera()}
                disabled={disabled || isUploading}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {displayError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs font-medium text-red-700">{displayError}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void openCamera()}
              disabled={disabled || isUploading}
              className="inline-flex min-h-[44px] items-center rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Open Camera
            </button>
            {lastCapturedFile ? (
              <button
                type="button"
                onClick={handleRetryUpload}
                disabled={disabled || isUploading}
                className="inline-flex min-h-[44px] items-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Retry Upload
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
