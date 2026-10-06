import { supabase, STORAGE_BUCKET } from './supabase';
import { optimizeImage } from './optimizeImage';

// Supabase Storage per-file limit for this project (free plan)
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
// Originals are checked before optimization; photos shrink well below the storage limit
export const MAX_IMAGE_SOURCE_BYTES = 20 * 1024 * 1024;

export interface UploadedFile {
  name: string;
  filename: string;
  size: number;
  url: string;
}

export interface UploadResult {
  uploaded: UploadedFile[];
  failedNames: string[];
}

const extensionOf = (file: File) => file.name.match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase() ?? 'bin';

// Uploads attachments to the public bucket. Storage keys are generated because Supabase
// rejects non-ASCII keys such as Korean file names; the display name is kept in `name`.
export async function uploadFiles(folder: string, files: File[]): Promise<UploadResult> {
  if (!supabase) throw new Error('파일 저장소가 설정되지 않았습니다.');

  const result: UploadResult = { uploaded: [], failedNames: [] };
  for (const original of files) {
    const file = await optimizeImage(original);
    if (file.size > MAX_UPLOAD_BYTES) {
      result.failedNames.push(original.name);
      continue;
    }

    const filename = `${folder}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${extensionOf(file)}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, file, { contentType: file.type || undefined });
    if (error) {
      result.failedNames.push(original.name);
      continue;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    result.uploaded.push({ name: file.name, filename, size: file.size, url: data.publicUrl });
  }
  return result;
}

export const failedUploadMessage = (names: string[]) =>
  `다음 파일은 올리지 못했습니다 (파일당 최대 50MB):\n${names.join('\n')}`;
