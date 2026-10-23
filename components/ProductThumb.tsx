import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductThumbProps {
  src: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}

// Muestra la imagen del producto o un marcador si falta o falla la carga
export default function ProductThumb({ src, alt, className = '', iconClassName = 'w-10 h-10' }: ProductThumbProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-700/40 to-slate-800/60 text-slate-500 ${className}`}
      >
        <Package className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
