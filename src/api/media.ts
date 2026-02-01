import { http } from "./http";

export type UploadImageResponse = {
  url: string; // например "/uploads/xxx.webp"
};

export async function uploadImage(file: File, opts?: { signal?: AbortSignal }): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await http.post<UploadImageResponse>("/api/media/images", form, {
    signal: opts?.signal,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url;
}
