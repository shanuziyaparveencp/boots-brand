import { useEffect, useState } from 'react';
import { cn } from '../lib/format';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset when navigating between products.
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden bg-sand">
        <img
          src={activeImage}
          alt={productName}
          width={900}
          height={1125}
          className="aspect-[4/5] w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-pressed={index === activeIndex}
              className={cn(
                'overflow-hidden border bg-sand transition-colors',
                index === activeIndex ? 'border-ink' : 'border-transparent hover:border-ink/30',
              )}
            >
              <img
                src={image}
                alt=""
                width={900}
                height={1125}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
