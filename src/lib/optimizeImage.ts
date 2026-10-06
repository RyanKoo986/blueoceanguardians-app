const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
// Animated GIFs would lose their animation; SVGs are vectors
const UNTOUCHED_TYPES = ['image/gif', 'image/svg+xml'];

// Shrinks photos before upload (same approach as exe-shop): longest side at most 2000px,
// re-encoded as JPEG. Re-encoding also drops EXIF metadata such as GPS location, which
// matters because the storage bucket is public. Formats the browser cannot decode
// (e.g. HEIC on Android) are uploaded unchanged instead of failing.
export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || UNTOUCHED_TYPES.includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }

  // JPEG has no transparency, so transparent PNG areas become white instead of black
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
