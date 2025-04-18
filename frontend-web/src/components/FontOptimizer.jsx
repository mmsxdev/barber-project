import { useEffect } from 'react';

const FontOptimizer = () => {
  useEffect(() => {
    // Adiciona link preconnect para Google Fonts
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://fonts.gstatic.com';
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);

    // Carrega fontes de forma otimizada
    const fontLinks = [
      {
        href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
        type: 'text/css',
      },
      {
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        type: 'text/css',
      }
    ];

    fontLinks.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.href;
      link.type = font.type;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup
      document.head.removeChild(preconnectLink);
      fontLinks.forEach(() => {
        const links = document.querySelectorAll('link[rel="stylesheet"][media="all"]');
        links.forEach(link => document.head.removeChild(link));
      });
    };
  }, []);

  return null;
};

export default FontOptimizer; 