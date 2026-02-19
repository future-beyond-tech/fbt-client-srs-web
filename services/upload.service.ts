import { DEFAULT_UPLOAD_TIMEOUT_MS, type UploadPhotoOptions, type UploadPhotoResponse } from "@/types/upload";
import { buildApiUrl, fetchWithTimeout } from "@/lib/utils";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  let message = fallbackMessage;

  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload.message) {
      message = payload.message;
    } else if (payload.title) {
      message = payload.title;
    }
  } catch {
    // Ignore JSON parsing errors for error payloads.
  }

  return new Error(message);
}

export async function uploadPhoto(
  file: File,
  options: UploadPhotoOptions = {},
): Promise<string> {
  const { signal, timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS } = options;
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(buildApiUrl("/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
    signal,
    timeout: timeoutMs,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to upload photo.");
  }

  const data = (await response.json()) as Partial<UploadPhotoResponse> & {
    photoUrl?: string;
  };
  const photoUrl = data.url ?? data.photoUrl;

  if (!photoUrl) {
    throw new Error("Photo upload failed. Missing photo URL in response.");
  }

  return photoUrl;
}
