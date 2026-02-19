const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.7;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }

      reject(new Error("Unable to read the selected file."));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process image."));
    image.src = dataUrl;
  });
}

function getOutputFileName(fileName: string): string {
  const normalized = fileName.replace(/\.[^.]+$/, "");
  const base = normalized.trim() || "customer-photo";
  return `${base}.jpg`;
}

export async function compressImage(file: File): Promise<File> {
  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Unable to process image dimensions.");
  }

  const scale = sourceWidth > MAX_WIDTH ? MAX_WIDTH / sourceWidth : 1;
  const targetWidth = Math.round(sourceWidth * scale);
  const targetHeight = Math.round(sourceHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image compression is not supported on this browser.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    throw new Error("Unable to compress image. Please try another photo.");
  }

  return new File([blob], getOutputFileName(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
