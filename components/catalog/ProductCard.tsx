import { Eye, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import type { AccentStyles, Product } from '../../lib/types';

interface ProductCardProps {
  product: Product;
  accent: AccentStyles;
  onViewDetail: (product: Product) => void;
  onAddToQuote: (product: Product) => void;
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
        available
          ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
          : 'bg-sunken text-muted'
      }`}
      aria-label={available ? 'En existencia' : 'Bajo pedido'}
    >
      {available ? <span className="text-[10px]" aria-hidden="true">●</span> : <span className="text-[10px]" aria-hidden="true">○</span>}
      {available ? 'En existencia' : 'Bajo pedido'}
    </span>
  );
}

export function ProductListItem({ product, accent, onViewDetail, onAddToQuote }: ProductCardProps) {
  const available = product.stock > 0;

  return (
    <div className="flex items-start gap-4 px-4 py-3.5 transition-colors duration-150 ease-tahoe hover:bg-sunken/70">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-sunken">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex h-full w-full items-center justify-center text-muted ${product.image ? 'hidden' : ''}`}>
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="font-mono font-medium">{product.id}</span>
          <span className="truncate">{product.category}</span>
        </div>
        <p className="mt-1.5 text-sm font-medium leading-snug text-ink">{product.name}</p>
        {product.model && <p className="mt-0.5 text-xs text-muted">Modelo {product.model}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <AvailabilityBadge available={available} />
        <div className="flex gap-1.5">
          <button
            onClick={() => onViewDetail(product)}
            className="rounded-md border border-line px-2.5 py-1.5 text-muted transition-all duration-150 ease-tahoe hover:border-navy-400 hover:text-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50"
            aria-label={`Ver detalle de ${product.name}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={() => onAddToQuote(product)}
            className={`rounded-md px-2.5 py-1.5 transition-all duration-150 ease-tahoe ${accent.bg} ${accent.bgHover} ${accent.onAccent} active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50`}
            aria-label={`Agregar ${product.name} a la solicitud`}
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGridItem({ product, accent, onViewDetail, onAddToQuote }: ProductCardProps) {
  const available = product.stock > 0;

  return (
    <article className="panel flex flex-col overflow-hidden transition-all duration-200 ease-tahoe [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-tahoe-lift active:scale-[0.995]">
      <div className="relative aspect-square w-full overflow-hidden border-b border-line bg-sunken">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex h-full w-full items-center justify-center text-muted ${product.image ? 'hidden' : ''}`}>
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="absolute right-2 top-2">
          <AvailabilityBadge available={available} />
        </div>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium text-muted">{product.id}</span>
        </div>
        <div className="flex-1 pt-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</h3>
          <p className="mt-1 truncate text-xs text-muted">{product.category}</p>
          {product.model && <p className="mt-0.5 truncate text-xs text-muted">Modelo {product.model}</p>}
        </div>
        <div className="mt-4 flex gap-2 border-t border-line pt-3">
          <button
            onClick={() => onViewDetail(product)}
            className="btn-ghost flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50"
          >
            <Eye className="h-4 w-4" aria-hidden="true" /> Detalle
          </button>
          <button
            onClick={() => onAddToQuote(product)}
            className={`rounded-lg px-3 py-2 transition-all duration-150 ease-tahoe ${accent.bg} ${accent.bgHover} ${accent.onAccent} active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50`}
            aria-label={`Agregar ${product.name} a la solicitud`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
