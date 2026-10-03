import { requireSupabase } from './supabase';

export const BUCKET = 'product-images';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface UploadResult {
  url: string;
  path: string;
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type.split('/')[1] ?? 'jpg';
}

/** Rejects anything that is not a reasonably sized image before uploading. */
export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return `${file.name}: only JPG, PNG, WebP or AVIF images are allowed.`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name}: image is larger than 5 MB.`;
  }
  return null;
}

/**
 * Uploads one image and returns its public URL.
 *
 * Files live under <slug>/<timestamp>-<random>.<ext> so re-uploading never
 * overwrites an existing image and the bucket stays browsable by product.
 */
export async function uploadProductImage(file: File, slug: string): Promise<UploadResult> {
  const problem = validateImage(file);
  if (problem) throw new Error(problem);

  const supabase = requireSupabase();
  const safeSlug = slug || 'unsorted';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${safeSlug}/${unique}.${extensionFor(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    if (/row-level security|not authorized/i.test(error.message)) {
      throw new Error('You do not have permission to upload images. Try signing in again.');
    }
    if (/bucket not found/i.test(error.message)) {
      throw new Error('The product-images storage bucket is missing. Run the migration.');
    }
    throw new Error(`Could not upload ${file.name}. Please try again.`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Removes an uploaded file from storage. Only touches files in our bucket --
 * the seeded products reference /images/... paths bundled with the site, and
 * those are left alone.
 */
export async function deleteProductImage(url: string): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;
  await requireSupabase().storage.from(BUCKET).remove([path]);
}

/** Extracts the storage path from a public URL, or null if not ours. */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export function isUploadedImage(url: string): boolean {
  return storagePathFromUrl(url) !== null;
}
