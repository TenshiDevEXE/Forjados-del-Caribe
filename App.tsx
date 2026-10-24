import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCopy, ClipboardList, Mail, MapPin, MessageCircle, Minus, Package, Phone, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));
import CatalogFilters from './components/catalog/CatalogFilters';
import { ProductGridItem, ProductListItem } from './components/catalog/ProductCard';

import { ACCENT_STYLES, LOGO_ICONS } from './lib/theme';
import type { Product, TabId } from './lib/types';

import { useCatalog, useTheme } from './hooks/useCatalog';
import { useProductFilters } from './hooks/useProductFilters';
import { useQuote } from './hooks/useQuote';
import { formatCount, whatsappNumber } from './utils/format';
import { VIEW_MODE_STORAGE_KEY } from './lib/constants';

type ViewMode = 'grid' | 'list';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof Package;
  badge?: number;
}

export default function App() {
  const { catalog, loadError } = useCatalog();
  const { theme, toggleTheme } = useTheme();
  const {
    quoteItems,
    customerName,
    setCustomerName,
    quoteNote,
    setQuoteNote,
    phoneIndex,
    setPhoneIndex,
    notification,
    setNotification,
    addToQuote,
    changeQuantity,
    removeFromQuote,
    clearQuote,
    quoteCount,
  } = useQuote();

  const [activeTab, setActiveTab] = useState<TabId>('catalog');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return stored === 'grid' || stored === 'list' ? stored : 'list';
    } catch {
      return 'list';
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {}
  }, [viewMode]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const config = catalog?.config;
  const categories = catalog?.categories ?? [];
  const products = catalog?.products ?? [];

  const accent = ACCENT_STYLES[config?.accentColor ?? 'gold'];
  const LogoIcon = LOGO_ICONS[config?.logoType ?? 'wrench'];

  const phones = config?.contactPhones ?? [];
  const selectedPhone = phones[phoneIndex] ?? phones[0];

  const {
    searchTerm,
    setSearchTerm,
    selectedGroup,
    setSelectedGroup,
    selectedCategory,
    setSelectedCategory,
    availableOnly,
    setAvailableOnly,
    sortBy,
    setSortBy,
    visibleProducts,
    filteredProducts,
    groups,
    productsByCategory,
    activeGroup,
    hasFilters,
    clearFilters,
    loadMore,
    canLoadMore,
    remainingCount,
  } = useProductFilters(products, categories);

  const availableCount = useMemo(
    () => products.reduce((total, product) => total + (product.stock > 0 ? 1 : 0), 0),
    [products]
  );

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3200);
    return () => clearTimeout(timer);
  }, [notification, setNotification]);

  const [copied, setCopied] = useState(false);

  const copyQuote = useCallback(async () => {
    if (quoteItems.length === 0) return;
    const lines = quoteItems.map(
      item => `- ${item.quantity} x ${item.product.name} (Codigo ${item.product.id})`
    );
    const text = [
      `Solicitud de cotizacion - ${config?.name ?? 'Catalogo'}`,
      '',
      ...lines,
      customerName.trim() && `Cliente: ${customerName.trim()}`,
      quoteNote.trim() && `Comentario: ${quoteNote.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotification({ message: 'No se pudo copiar la lista', type: 'error' });
    }
  }, [quoteItems, customerName, quoteNote, config?.name, setNotification]);
    const phone = whatsappNumber(selectedPhone?.phone ?? '');
    if (!phone) {
      setNotification({ message: 'Configura al menos un número de WhatsApp para enviar la solicitud', type: 'error' });
      return;
    }
    const lines = quoteItems.map(
      item => `• ${item.quantity} x ${item.product.name} (Código ${item.product.id})`
    );
    const message = [
      `*Solicitud de cotización* — ${config?.name ?? 'Catálogo'}`,
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
  }, [quoteItems, customerName, quoteNote, selectedPhone, config?.name, setNotification]);

  const tabs: TabDef[] = [
    { id: 'catalog', label: 'Catálogo', icon: Package },
    { id: 'quote', label: 'Solicitud', icon: ClipboardList, badge: quoteCount },
  ];

  if (!catalog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-ink">
        <div className="max-w-sm text-center">
          {loadError ? (
            <>
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-600" aria-hidden="true" />
              <h1 className="font-bold tracking-tight">No se pudo cargar el catálogo</h1>
              <p className="mt-1 text-sm text-muted">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-ghost mt-5"
              >
                Reintentar
              </button>
            </>
          ) : (
            <>
              <Package className="mx-auto mb-3 h-10 w-10 animate-pulse text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">Cargando catálogo…</p>
              <p className="mt-2 text-xs text-muted">Esto puede tomar unos segundos</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const groupChip = (active: boolean) =>
    `chip px-3 py-1.5 text-sm ${
      active
        ? 'border-navy-800 bg-navy-800 text-white'
        : 'border-line bg-elevated text-muted hover:border-navy-400 hover:text-ink'
    }`;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex min-w-0 items-center gap-3 text-left transition-opacity duration-150 ease-tahoe hover:opacity-90"
              aria-label={`${config?.name} — ir al catálogo`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent.gradient}`}
              >
                <LogoIcon className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold leading-tight tracking-tight text-ink">
                  {config?.name}
                </span>
                <span className="block truncate text-xs text-muted">{config?.slogan}</span>
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              {config?.contactPhone && (
                <a
                  href={`tel:${config.contactPhone.replace(/[^\d+]/g, '')}`}
                  className="hidden items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-navy-400 md:inline-flex"
                >
                  <Phone className="h-4 w-4 text-muted" />
                  {config.contactPhone}
                </a>
              )}
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>

          <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Navegación principal" role="tablist">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-semibold whitespace-nowrap transition-all duration-150 ease-tahoe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50 rounded-sm active:scale-[0.98] ${
                    active
                      ? 'border-gold-500 text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-selected={active}
                  role="tab"
                  tabIndex={active ? 0 : -1}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                        active ? `${accent.bg} ${accent.onAccent}` : 'bg-sunken text-muted'
                      }`}
                      aria-label={`${tab.badge} productos en la solicitud`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main>
        {activeTab === 'catalog' && (
          <section className="border-b border-line bg-gradient-to-br from-navy-900 to-navy-950">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                Catálogo de productos
              </p>
              <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                {config?.slogan}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-200">
                Consulte referencias y existencias y solicite su cotización sin compromiso. Los precios
                se envían por WhatsApp o correo.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
                {[
                  { label: 'Referencias', value: products.length },
                  { label: 'Líneas de producto', value: categories.length },
                  { label: 'Con existencia', value: availableCount },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="font-mono text-2xl font-semibold text-gold-400">
                      {formatCount(stat.value)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-navy-300">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {activeTab === 'catalog' && (
            <section className="tab-enter space-y-5">
              <CatalogFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                groups={groups}
                selectedGroup={selectedGroup}
                onGroupChange={setSelectedGroup}
                activeGroup={activeGroup}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                productsByCategory={productsByCategory}
                totalProducts={products.length}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                accent={accent}
                availableOnly={availableOnly}
                onAvailableOnlyChange={setAvailableOnly}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">{formatCount(filteredProducts.length)}</span>{' '}
                  {filteredProducts.length === 1 ? 'referencia' : 'referencias'}
                  {selectedCategory
                    ? ` en ${selectedCategory}`
                    : activeGroup
                      ? ` en ${activeGroup.name}`
                      : ''}
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="panel px-6 py-16 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted/50" />
                  <p className="mt-4 font-semibold text-ink">Sin resultados</p>
                  <p className="mt-1 text-sm text-muted">
                    No hay referencias que coincidan con los filtros aplicados.
                  </p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="btn-ghost mt-5">
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <div className="panel divide-y divide-line overflow-hidden stagger">
                  {visibleProducts.map(product => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      accent={accent}
                      onViewDetail={setSelectedProduct}
                      onAddToQuote={addToQuote}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger">
                  {visibleProducts.map(product => (
                    <ProductGridItem
                      key={product.id}
                      product={product}
                      accent={accent}
                      onViewDetail={setSelectedProduct}
                      onAddToQuote={addToQuote}
                    />
                  ))}
                </div>
              )}

              {canLoadMore && (
                <div className="pt-2 text-center">
                  <button onClick={loadMore} className="btn-ghost px-5 py-2.5 transition-all duration-150 ease-tahoe active:scale-[0.98]">
                    Cargar más referencias
                    <span className="text-muted">({formatCount(remainingCount)} restantes)</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === 'quote' && (
            <section className="tab-enter grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="panel p-5">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                  <h2 className="flex items-center gap-2 font-bold tracking-tight text-ink">
                    <ClipboardList className="h-5 w-5 text-muted" /> Productos solicitados
                  </h2>
                  {quoteItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyQuote}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
                        aria-label="Copiar lista de cotización"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" /> {copied ? 'Copiado' : 'Copiar'}
                      </button>
                      <button
                        onClick={clearQuote}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline dark:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Vaciar lista
                      </button>
                    </div>
                  )}
                </div>

                {quoteItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-muted/50" />
                    <p className="mt-4 font-semibold text-ink">Su solicitud está vacía</p>
                    <p className="mt-1 text-sm text-muted">
                      Agregue referencias del catálogo para pedir su cotización.
                    </p>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className={`btn-accent mt-5 ${accent.bg} ${accent.bgHover} ${accent.onAccent}`}
                    >
                      <Package className="h-4 w-4" /> Explorar catálogo
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {quoteItems.map(item => (
                      <li key={item.product.id} className="flex items-start gap-4 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-muted">{item.product.id}</p>
                          <p className="mt-1 text-sm font-medium leading-snug text-ink">
                            {item.product.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => changeQuantity(item.product.id, -1)}
                            className="rounded-md border border-line p-1.5 text-muted transition-colors hover:border-navy-400 hover:text-ink"
                            aria-label={`Quitar una unidad de ${item.product.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.product.id, 1)}
                            className="rounded-md border border-line p-1.5 text-muted transition-colors hover:border-navy-400 hover:text-ink"
                            aria-label={`Agregar una unidad de ${item.product.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromQuote(item.product.id)}
                          className="shrink-0 rounded-md p-1.5 text-rose-700 transition-colors hover:bg-rose-600/10 dark:text-rose-300"
                          aria-label={`Eliminar ${item.product.name} de la solicitud`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <aside className="panel h-fit p-5">
                <h2 className="font-bold tracking-tight text-ink">Enviar solicitud</h2>
                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Nombre (opcional)
                    </label>
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Comentario (opcional)
                    </label>
                    <textarea
                      value={quoteNote}
                      onChange={e => setQuoteNote(e.target.value)}
                      className="field min-h-[80px]"
                    />
                  </div>
                  {phones.length > 1 && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Enviar a
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {phones.map((option, index) => (
                          <button
                            key={option.phone}
                            type="button"
                            onClick={() => setPhoneIndex(index)}
                            className={groupChip(index === phoneIndex)}
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
                    className={`btn-accent w-full pt-3 pb-3 ${
                      quoteItems.length === 0
                        ? 'cursor-not-allowed border border-line bg-sunken text-muted'
                        : `${accent.bg} ${accent.bgHover} ${accent.onAccent}`
                    }`}
                  >
                    <Send className="h-4 w-4" /> Solicitar por WhatsApp
                  </button>
                  <p className="text-center text-xs leading-relaxed text-muted">
                    La solicitud se envía sin precios. Un asesor le responderá con la cotización.
                  </p>
                </div>
              </aside>
            </section>
          )}
        </div>
      </main>

      <footer className="mt-16 border-t border-navy-800 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent.gradient}`}
                >
                  <LogoIcon className="h-5 w-5 text-white" />
                </span>
                <span className="text-sm font-bold tracking-tight text-white">{config?.name}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy-300">{config?.slogan}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">Contacto</p>
              <ul className="mt-3 space-y-2.5 text-sm text-navy-200">
                {config?.contactPhone && (
                  <li>
                    <a
                      href={`tel:${config.contactPhone.replace(/[^\d+]/g, '')}`}
                      className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <Phone className="h-4 w-4 text-navy-400" />
                      {config.contactPhone}
                    </a>
                  </li>
                )}
                {phones.map(option => (
                  <li key={option.phone}>
                    <a
                      href={`https://wa.me/${whatsappNumber(option.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 text-navy-400" />
                      {option.phone} · {option.label}
                    </a>
                  </li>
                ))}
                {config?.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${config.contactEmail}`}
                      className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-navy-400" />
                      {config.contactEmail}
                    </a>
                  </li>
                )}
                {config?.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                    <span>{config.address}</span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                Cotizaciones
              </p>
              <p className="mt-3 text-sm leading-relaxed text-navy-200">
                Los precios no se publican en el catálogo. Arme su lista de referencias y solicítela:
                recibirá la cotización por WhatsApp o correo.
              </p>
              <p className="mt-4 text-xs text-navy-400">{config?.footerText}</p>
            </div>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {notification && (
        <div
          className={`toast-enter fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border bg-elevated/95 backdrop-blur-xl px-4 py-3 text-sm shadow-tahoe-lift ${
            notification.type === 'error'
              ? 'border-rose-600/40 text-rose-700 dark:text-rose-300'
              : notification.type === 'info'
                ? 'border-line text-ink'
                : 'border-emerald-600/40 text-emerald-700 dark:text-emerald-300'
          }`}
          role="status"
          aria-live="polite"
        >
          {notification.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 left-5 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-line bg-elevated/95 backdrop-blur-xl text-muted shadow-tahoe-lift transition-all duration-150 ease-tahoe hover:text-ink active:scale-[0.98]"
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
