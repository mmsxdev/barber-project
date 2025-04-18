import { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className, width, height }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Função para gerar srcset para diferentes tamanhos
  const generateSrcSet = (src) => {
    const sizes = [300, 600, 900];
    return sizes
      .map((size) => {
        const webpSrc = src.replace(/\.(jpg|png)/, '.webp');
        return `${webpSrc} ${size}w`;
      })
      .join(', ');
  };

  // Placeholder blur data URL para melhor UX durante carregamento
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLUEwLi0tLTAtQFBGRjpGPUA1R2c9PUdhYWFhQU1NY2NtYWFtYWH/2wBDARUXFyAeIBogHiAgIiBqRjpGY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  return (
    <picture>
      {/* WebP format para navegadores modernos */}
      <source
        type="image/webp"
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {/* Fallback para formatos tradicionais */}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          backgroundColor: '#f3f4f6',
          objectFit: 'cover',
          backgroundImage: `url(${blurDataURL})`,
          backgroundSize: 'cover',
        }}
      />
    </picture>
  );
};

export default OptimizedImage; 