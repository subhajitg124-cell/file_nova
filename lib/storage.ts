import { put, del, list } from "@vercel/blob";

export async function uploadFile(key: string, body: Buffer | string) {
  const blob = await put(key, body, {
    access: "public",
  });
  return blob;
}

export async function deleteFile(url: string) {
  await del(url);
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
