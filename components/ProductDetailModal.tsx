import { CheckCircle2, Clock, Image as ImageIcon, ShoppingCart, Wrench } from 'lucide-react';
import ModalShell from './ModalShell';
import type { AccentStyles, Product } from '../lib/types';

interface ProductDetailModalProps {
  product: Product;
  inQuote: boolean;
  accent: AccentStyles;
  onClose: () => void;
  onAddToQuote: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  inQuote,
  accent,
  onClose,
  onAddToQuote,
}: ProductDetailModalProps) {
  const available = product.stock > 0;

  return (
    <ModalShell
      title={product.name}
      subtitle={product.category}
      icon={<Wrench className="h-5 w-5" />}
      accent={accent}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5">
          {product.image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-sunken">
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
              <div className="hidden flex h-full w-full items-center justify-center text-muted">
                <ImageIcon className="h-10 w-10" aria-hidden="true" />
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                available
                  ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-sunken text-muted'
              }`}
            >
              {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {available ? 'En existencia' : 'Bajo pedido'}
            </span>
            <span className={`${accent.softBg} ${accent.text} rounded-md px-2.5 py-1 text-xs font-semibold`}>
              {product.category}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Código</dt>
              <dd className="mt-1 font-mono text-ink">{product.id}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Existencia</dt>
              <dd className="mt-1 text-ink">{available ? `${product.stock} unidades` : 'Bajo pedido'}</dd>
            </div>
            {product.model && (
              <div className="col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Modelo</dt>
                <dd className="mt-1 text-ink">{product.model}</dd>
              </div>
            )}
          </dl>

          <p className="text-xs leading-relaxed text-muted">
            Los precios no se publican en el catálogo: agregue la referencia a su solicitud y un asesor
            le responderá con la cotización.
          </p>

          <button
            onClick={() => onAddToQuote(product)}
            className={`btn-accent ${accent.bg} ${accent.bgHover} ${accent.onAccent}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {inQuote ? 'Agregar otra unidad' : 'Agregar a la solicitud'}
          </button>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-sunken p-5">
          {!product.image && (
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-lg border border-line bg-elevated text-muted">
              <ImageIcon className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Referencia</p>
          <p className="mt-1.5 break-all font-mono text-xl font-semibold text-ink">{product.id}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Línea de producto</p>
          <p className="mt-1.5 text-sm text-ink">{product.category}</p>
        </aside>
      </div>
    </ModalShell>
  );
}
