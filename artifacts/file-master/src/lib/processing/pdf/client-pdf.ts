import { wrap } from 'comlink';

export async function runClientSidePdfMerge(files: File[]): Promise<Blob> {
  const worker = new Worker(new URL('./merge.worker.ts', import.meta.url));
  const api = wrap<any>(worker);
  const filesData = await Promise.all(
    files.map(async (f) => ({ name: f.name, buffer: await f.arrayBuffer() }))
  );
  const mergedUint8 = await api.mergePdfs(filesData);
  worker.terminate();
  return new Blob([mergedUint8], { type: 'application/pdf' });
}

export async function runClientSidePdfCompress(file: File, quality: number): Promise<Blob> {
  const worker = new Worker(new URL('./merge.worker.ts', import.meta.url));
  const api = wrap<any>(worker);
  const fileData = { name: file.name, buffer: await file.arrayBuffer() };
  const compressedUint8 = await api.compressPdf(fileData, quality);
  worker.terminate();
  return new Blob([compressedUint8], { type: 'application/pdf' });
}
