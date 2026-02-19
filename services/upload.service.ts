import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import { DEFAULT_UPLOAD_TIMEOUT_MS, type UploadPhotoOptions } from "@/types/upload";
import type { UploadResponseDto } from "@/types/api";

export async function uploadPhoto(
  file: File,
  options: UploadPhotoOptions = {},
): Promise<string> {
  const { signal, timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS } = options;

  return handleApiRequest(
    async () => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<UploadResponseDto>("/api/upload", formData, {
        signal,
        timeout: timeoutMs,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url = response.data?.url?.trim();
      if (!url) {
        throw new Error("Photo upload failed. Missing photo URL in response.");
      }

      return url;
    },
    {
      errorMessage: "Unable to upload photo.",
    },
  );
}
