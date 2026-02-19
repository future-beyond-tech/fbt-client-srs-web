export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
export const DEFAULT_UPLOAD_TIMEOUT_MS = 20000;

export type UploadPhotoResponse = {
  url: string;
};

export type UploadPhotoOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};
