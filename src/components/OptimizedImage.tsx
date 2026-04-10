import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-400 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
