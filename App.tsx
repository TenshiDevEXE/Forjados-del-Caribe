import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Grid,
  List,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Send,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
import ProductThumb from './components/ProductThumb';
import ProductDetailModal from './components/ProductDetailModal';

import { ACCENT_STYLES, LOGO_ICONS } from './lib/theme';
import { categories, config, products, subcategories } from './lib/api';
import type { Notification, Product, QuoteItem, TabId, Theme } from './lib/types';

type ViewMode = 'grid' | 'list';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof Package;
  badge?: number;
}

function whatsappNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

const THEME_STORAGE_KEY = 'catalogo:theme';

// El tema es una preferencia del visitante: se guarda localmente, no en el servidor
function readStoredTheme(): Theme | null {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? config.theme);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('catalog');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [phoneIndex, setPhoneIndex] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const accent = ACCENT_STYLES[config.accentColor];
  const LogoIcon = LOGO_ICONS[config.logoType];

  // El primer número de la lista es el principal: se usa por defecto.
  const phones = config.contactPhones;
  const selectedPhone = phones[phoneIndex] ?? phones[0];

  /* ==================== Datos derivados ==================== */

  const visibleSubcategories = useMemo(
    () => (selectedCategory ? subcategories.filter(s => s.categoryId === selectedCategory) : []),
    [selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(product => {
      if (selectedCategory && product.categoryId !== selectedCategory) return false;
      if (selectedSubcategory && product.subcategoryId !== selectedSubcategory) return false;
      if (!term) return true;
      return [product.name, product.sku, product.brand, product.model].some(field =>
        field.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, selectedCategory, selectedSubcategory]);

  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0);

  /* ==================== Notificaciones ==================== */

  const notify = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3200);
    return () => clearTimeout(timer);
  }, [notification]);

  /* ==================== Tema ==================== */

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  /* ==================== Solicitud de cotización ==================== */

  const addToQuote = useCallback(
    (product: Product) => {
      setQuoteItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      notify(`${product.name} agregado a la solicitud`, 'info');
    },
    [notify]
  );

  const changeQuantity = useCallback((productId: string, delta: number) => {
    setQuoteItems(prev =>
      prev
        .map(item =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromQuote = useCallback((productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const sendQuote = useCallback(() => {
    const phone = whatsappNumber(selectedPhone?.phone ?? '');
    if (!phone) {
      notify('Configura al menos un número de WhatsApp para enviar la solicitud', 'error');
      return;
    }
    // La solicitud nunca incluye precios
    const lines = quoteItems.map(
      item => `• ${item.quantity} x ${item.product.name}${item.product.sku ? ` (SKU ${item.product.sku})` : ''}`
    );
    const message = [
      `*Solicitud de cotización* — ${config.name}`,
      '',
      ...lines,
      '',
      customerName.trim() && `Cliente: ${customerName.trim()}`,
      quoteNote.trim() && `Comentario: ${quoteNote.trim()}`,
      '',
      'Por favor, indíquenme disponibilidad y precio.',
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }, [quoteItems, customerName, quoteNote, notify, selectedPhone]);

  /* ==================== Navegación ==================== */

  const tabs: TabDef[] = [
    { id: 'catalog', label: 'Catálogo', icon: Package },
    { id: 'quote', label: 'Solicitud', icon: ClipboardList, badge: quoteCount },
  ];

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  /* ==================== Render ==================== */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* ===== Encabezado ===== */}
      <header className="sticky top-0 z-40 glass border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shrink-0`}>
                <LogoIcon className="w-6 h-6 text-slate-950" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-white leading-tight truncate">{config.name}</h1>
                <p className="text-xs text-slate-400 truncate">{config.slogan}</p>
              </div>
            </div>

            <ThemeToggle theme={theme} onToggle={toggleTheme} accentBg={accent.bg} />
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? `${accent.bg} text-slate-950` : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                  {tab.badge ? (
                    <span className={`px-1.5 rounded-full text-xs font-bold ${active ? 'bg-slate-950/25' : accent.softBg}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ===== Catálogo ===== */}
        {activeTab === 'catalog' && (
          <section className="tab-enter space-y-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, marca o código…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid' ? `${accent.bg} text-slate-950` : 'glass text-slate-400 hover:text-white'}`}
                  aria-label="Vista en cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-colors ${viewMode === 'list' ? `${accent.bg} text-slate-950` : 'glass text-slate-400 hover:text-white'}`}
                  aria-label="Vista en lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory ? `${accent.bg} text-slate-950` : 'glass text-slate-300 hover:text-white'
                }`}
              >
                Todas
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedSubcategory(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id ? `${accent.bg} text-slate-950` : 'glass text-slate-300 hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {visibleSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visibleSubcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() =>
                      setSelectedSubcategory(prev => (prev === subcategory.id ? null : subcategory.id))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSubcategory === subcategory.id
                        ? `${accent.softBg} ${accent.text} ${accent.border}`
                        : 'border-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'}
              {selectedCategoryName ? ` en ${selectedCategoryName}` : ''}
            </p>

            {filteredProducts.length === 0 ? (
              <div className="glass rounded-2xl border border-slate-700/50 p-12 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron productos con los filtros actuales.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <article
                    key={product.id}
                    className="glass rounded-2xl border border-slate-700/50 overflow-hidden card-hover flex flex-col"
                  >
                    <div className="relative img-zoom">
                      <ProductThumb
                        src={product.image}
                        alt={product.name}
                        className="w-full h-44"
                        iconClassName="w-14 h-14"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/70 text-slate-200 backdrop-blur">
                        {product.categoryName}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-white leading-snug">{product.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {[product.brand, product.model].filter(Boolean).join(' · ') || 'Sin marca'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{product.sku}</p>
                      <div className="mt-auto pt-4 flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl glass text-sm text-slate-200 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Detalle
                        </button>
                        <button
                          onClick={() => addToQuote(product)}
                          className={`px-3 py-2 rounded-xl ${accent.bg} ${accent.bgHover} text-slate-950 transition-colors`}
                          aria-label="Agregar a la solicitud"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="glass rounded-xl border border-slate-700/50 p-3 flex items-center gap-4"
                  >
                    <ProductThumb
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg shrink-0"
                      iconClassName="w-6 h-6"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {[product.brand, product.model, product.categoryName].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="hidden sm:block text-xs font-mono text-slate-500">{product.sku}</span>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 rounded-lg glass text-slate-300 hover:text-white transition-colors"
                      aria-label="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToQuote(product)}
                      className={`p-2 rounded-lg ${accent.bg} ${accent.bgHover} text-slate-950 transition-colors`}
                      aria-label="Agregar a la solicitud"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== Solicitud de cotización ===== */}
        {activeTab === 'quote' && (
          <section className="tab-enter grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass rounded-2xl border border-slate-700/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Productos solicitados
                </h2>
                {quoteItems.length > 0 && (
                  <button
                    onClick={() => setQuoteItems([])}
                    className="text-xs text-rose-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Vaciar lista
                  </button>
                )}
              </div>

              {quoteItems.length === 0 ? (
                <div className="py-14 text-center text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tu solicitud está vacía.</p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${accent.bg} ${accent.bgHover} text-slate-950 transition-colors`}
                  >
                    <Package className="w-4 h-4" /> Explorar catálogo
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-700/40">
                  {quoteItems.map(item => (
                    <li key={item.product.id} className="flex items-center gap-4 py-3">
                      <ProductThumb
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg shrink-0"
                        iconClassName="w-6 h-6"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{item.product.sku}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => changeQuantity(item.product.id, -1)}
                          className="p-1.5 rounded-lg glass text-slate-300 hover:text-white"
                          aria-label="Quitar una unidad"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-9 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.product.id, 1)}
                          className="p-1.5 rounded-lg glass text-slate-300 hover:text-white"
                          aria-label="Agregar una unidad"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromQuote(item.product.id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        aria-label="Eliminar de la solicitud"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass rounded-2xl border border-slate-700/50 p-5 h-fit">
              <h2 className="font-bold text-white mb-4">Enviar solicitud</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                    Tu nombre (opcional)
                  </label>
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={quoteNote}
                    onChange={e => setQuoteNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-100 min-h-[80px] focus:outline-none"
                  />
                </div>
                {phones.length > 1 && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                      Enviar a
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {phones.map((option, index) => (
                        <button
                          key={option.phone}
                          type="button"
                          onClick={() => setPhoneIndex(index)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            index === phoneIndex
                              ? `${accent.bg} text-slate-950`
                              : 'glass text-slate-300 hover:text-white'
                          }`}
                        >
                          {option.label}
                          {option.phone ? ` · ${option.phone}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={sendQuote}
                  disabled={quoteItems.length === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    quoteItems.length === 0
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : `${accent.bg} ${accent.bgHover} text-slate-950`
                  }`}
                >
                  <Send className="w-4 h-4" /> Solicitar por WhatsApp
                </button>
                <p className="text-xs text-slate-500 text-center">
                  La solicitud se envía sin precios. Un asesor te responderá con la cotización.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===== Pie de página ===== */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <div className="glass rounded-2xl border border-slate-700/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center`}>
              <LogoIcon className="w-5 h-5 text-slate-950" />
            </div>
            <p className="text-sm text-slate-400">{config.footerText}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            {config.contactPhone && (
              <a
                href={`tel:${config.contactPhone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                {config.contactPhone}
              </a>
            )}
            {phones.map(option => (
              <a
                key={option.phone}
                href={`https://wa.me/${whatsappNumber(option.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {option.phone}
                <span className="text-slate-500">{option.label}</span>
              </a>
            ))}
            {config.contactEmail && (
              <span className="inline-flex items-center gap-2">
                <Mail className="w-4 h-4" /> {config.contactEmail}
              </span>
            )}
            {config.address && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {config.address}
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* ===== Modales ===== */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          inQuote={quoteItems.some(item => item.product.id === selectedProduct.id)}
          accent={accent}
          onClose={() => setSelectedProduct(null)}
          onAddToQuote={product => {
            addToQuote(product);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* ===== Notificación ===== */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-[60] toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border text-sm max-w-sm ${
            notification.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              : notification.type === 'info'
                ? 'bg-slate-800/90 border-slate-600/60 text-slate-200'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
