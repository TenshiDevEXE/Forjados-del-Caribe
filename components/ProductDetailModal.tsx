import { CheckCircle2, ShoppingCart, Wrench } from 'lucide-react';
import ModalShell from './ModalShell';
import ProductThumb from './ProductThumb';
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
      subtitle={`${product.categoryName}${product.subcategoryName ? ` · ${product.subcategoryName}` : ''}`}
      icon={<Wrench className="w-5 h-5" />}
      accent={accent}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <ProductThumb
          src={product.image}
          alt={product.name}
          className="w-full h-64 rounded-xl border border-slate-700/50"
          iconClassName="w-16 h-16"
        />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accent.softBg} ${accent.text}`}>
              {product.categoryName}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                available ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {available ? 'Disponible' : 'A pedido'}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Código</dt>
              <dd className="font-mono text-slate-100">{product.sku}</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Marca</dt>
                <dd className="text-slate-100">{product.brand}</dd>
              </div>
            )}
            {product.model && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Modelo</dt>
                <dd className="text-slate-100">{product.model}</dd>
              </div>
            )}
          </dl>

          <p className="text-xs text-slate-500">
            Los precios no se publican en el catálogo: solicítalos y un asesor te responderá.
          </p>
        </div>
      </div>

      {product.description && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Descripción</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => onAddToQuote(product)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold ${accent.bg} ${accent.bgHover} text-slate-950 transition-colors`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inQuote ? 'Ya está en la solicitud' : 'Agregar a la solicitud'}
        </button>
      </div>
    </ModalShell>
  );
}
