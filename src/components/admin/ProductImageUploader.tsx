import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { deleteProductImage, isUploadedImage, uploadProductImage } from '../../lib/productImages';
import { cn } from '../../lib/format';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Used to group uploads into a folder per product. */
  slug: string;
  disabled?: boolean;
}

export default function ProductImageUploader({
  images,
  onChange,
  slug,
  disabled,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    const failures: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const result = await uploadProductImage(file, slug);
        uploaded.push(result.url);
      } catch (err) {
        failures.push(err instanceof Error ? err.message : `Could not upload ${file.name}.`);
      }
    }

    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    if (failures.length > 0) setError(failures.join(' '));

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  }

  async function remove(index: number) {
    const url = images[index];
    onChange(images.filter((_, i) => i !== index));
    // Only clean up files we actually uploaded; bundled /images/... stay put.
    if (isUploadedImage(url)) {
      try {
        await deleteProductImage(url);
      } catch {
        // The product no longer references it; an orphaned file is harmless.
      }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
        >
          {uploading ? (
            <>
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <ImagePlus size={14} strokeWidth={1.8} />
              Upload Images
            </>
          )}
        </button>
        <p className="text-xs text-ink/50">
          JPG, PNG, WebP or AVIF. Up to 5 MB each. The first image is the main one.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-3 text-xs text-brand">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="mt-4 border border-dashed border-ink/20 px-4 py-8 text-center text-sm text-ink/45">
          No images yet. At least one is required before a product can go live.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="group relative border border-ink/10 bg-sand">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="aspect-[4/5] w-full object-cover"
              />

              {index === 0 && (
                <span className="absolute left-0 top-0 bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cream">
                  Main
                </span>
              )}

              <div className="flex items-center justify-between gap-1 border-t border-ink/10 bg-white p-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label="Move image earlier"
                    className="p-1.5 text-ink/50 transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ArrowLeft size={13} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === images.length - 1}
                    aria-label="Move image later"
                    className="p-1.5 text-ink/50 transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ArrowRight size={13} strokeWidth={1.8} />
                  </button>
                </div>

                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => makePrimary(index)}
                    disabled={disabled || index === 0}
                    aria-label="Make this the main image"
                    title="Make main image"
                    className={cn(
                      'p-1.5 transition-colors disabled:opacity-25',
                      index === 0 ? 'text-brand' : 'text-ink/50 hover:text-brand',
                    )}
                  >
                    <Star size={13} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(index)}
                    disabled={disabled}
                    aria-label="Remove image"
                    className="p-1.5 text-ink/50 transition-colors hover:text-brand disabled:opacity-25"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
