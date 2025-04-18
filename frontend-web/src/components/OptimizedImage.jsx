import { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className, width, height }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para converter a imagem para WebP
    const convertToWebP = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Criar um canvas para converter a imagem
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              resolve(URL.createObjectURL(blob));
            }, 'image/webp', 0.8); // Qualidade 0.8 para melhor equilíbrio
          };
          img.src = URL.createObjectURL(blob);
        });
      } catch (error) {
        console.error('Erro ao converter imagem:', error);
        return imageUrl; // Fallback para imagem original
      }
    };

    const loadImage = async () => {
      setLoading(true);
      const webpSrc = await convertToWebP(src);
      setImageSrc(webpSrc);
      setLoading(false);
    };

    loadImage();

    // Cleanup
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  return (
    <>
      {loading ? (
        <div 
          className={`${className} bg-gray-200 animate-pulse`}
          style={{ width, height }}
          role="presentation"
          aria-label="Carregando imagem..."
        />
      ) : (
        <picture>
          <source srcSet={imageSrc} type="image/webp" />
          <img
            src={src}
            alt={alt}
            className={className}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
          />
        </picture>
      )}
    </>
  );
};

export default OptimizedImage; 