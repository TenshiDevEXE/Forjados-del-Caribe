import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
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
  X,
} from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
import ProductDetailModal from './components/ProductDetailModal';

import { ACCENT_STYLES, LOGO_ICONS } from './lib/theme';
import { loadCatalog } from './lib/api';
import { buildGroups } from './lib/category-groups';
import type { Catalog, Notification, Product, QuoteItem, TabId, Theme } from './lib/types';

type ViewMode = 'grid' | 'list';

// Con miles de referencias no se renderizan todas de golpe: se muestran por tandas.
const PAGE_SIZE = 60;

const THEME_STORAGE_KEY = 'catalogo:theme';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof Package;
  badge?: number;
}

function whatsappNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatCount(value: number): string {
  return value.toLocaleString('es-DO');
}

// El tema es una preferencia del visitante: se guarda localmente, no en el servidor
function readStoredTheme(): Theme | null {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
        available
          ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
          : 'bg-sunken text-muted'
      }`}
    >
      {available ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {available ? 'En existencia' : 'Bajo pedido'}
    </span>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // El tema claro es el de la web corporativa; el visitante puede cambiarlo.
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? 'light');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('catalog');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [phoneIndex, setPhoneIndex] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* ==================== Carga del catálogo ==================== */

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal)
      .then(data => {
        setCatalog(data);
        // El tema del catálogo solo se aplica si el visitante no eligió uno.
        setTheme(readStoredTheme() ?? data.config.theme);
      })
      .catch(error => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });
    return () => controller.abort();
  }, []);

  const config = catalog?.config;
  const categories = catalog?.categories ?? [];
  const products = catalog?.products ?? [];

  const accent = ACCENT_STYLES[config?.accentColor ?? 'gold'];
  const LogoIcon = LOGO_ICONS[config?.logoType ?? 'wrench'];

  // El primer número de la lista es el principal: se usa por defecto.
  const phones = config?.contactPhones ?? [];
  const selectedPhone = phones[phoneIndex] ?? phones[0];

  /* ==================== Datos derivados ==================== */

  // Grupos de categorías (navegación): primero la familia, luego la categoría.
  const groups = useMemo(() => buildGroups(categories), [categories]);

  const productsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const availableCount = useMemo(
    () => products.reduce((total, product) => total + (product.stock > 0 ? 1 : 0), 0),
    [products]
  );

  const activeGroup = useMemo(
    () => groups.find(group => group.name === selectedGroup) ?? null,
    [groups, selectedGroup]
  );

  const groupCategories = useMemo(() => new Set(activeGroup?.categories ?? []), [activeGroup]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(product => {
      if (selectedCategory) {
        if (product.category !== selectedCategory) return false;
      } else if (activeGroup && !groupCategories.has(product.category)) {
        return false;
      }
      if (!term) return true;
      return [product.name, product.id, product.model ?? ''].some(field =>
        field.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm, selectedCategory, activeGroup, groupCategories]);

  // Al cambiar los filtros se vuelve a empezar por la primera referencia.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedGroup, selectedCategory]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0);
  const hasFilters = Boolean(searchTerm.trim() || selectedGroup || selectedCategory);

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
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  /* ==================== Filtros ==================== */

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGroup(null);
    setSelectedCategory(null);
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
  }, [quoteItems, customerName, quoteNote, notify, selectedPhone]);

  /* ==================== Navegación ==================== */

  const tabs: TabDef[] = [
    { id: 'catalog', label: 'Catálogo', icon: Package },
    { id: 'quote', label: 'Solicitud', icon: ClipboardList, badge: quoteCount },
  ];

  /* ==================== Carga y error ==================== */

  if (!catalog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-ink">
        <div className="max-w-sm text-center">
          {loadError ? (
            <>
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-600" />
              <h1 className="font-bold tracking-tight">No se pudo cargar el catálogo</h1>
              <p className="mt-1 text-sm text-muted">{loadError}</p>
            </>
          ) : (
            <>
              <Package className="mx-auto mb-3 h-10 w-10 animate-pulse text-muted" />
              <p className="text-sm text-muted">Cargando catálogo…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ==================== Estilos de filtro ==================== */

  const groupChip = (active: boolean) =>
    `chip px-3 py-1.5 text-sm ${
      active
        ? 'border-navy-800 bg-navy-800 text-white'
        : 'border-line bg-elevated text-muted hover:border-navy-400 hover:text-ink'
    }`;

  const categoryChip = (active: boolean) =>
    `chip px-2.5 py-1 text-xs ${
      active
        ? `${accent.border} ${accent.softBg} ${accent.text}`
        : 'border-line bg-elevated text-muted hover:border-navy-400 hover:text-ink'
    }`;

  const viewButton = (active: boolean) =>
    `inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
      active ? 'bg-navy-800 text-white' : 'text-muted hover:text-ink'
    }`;

  /* ==================== Render ==================== */

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ===== Encabezado ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-elevated/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex min-w-0 items-center gap-3 text-left"
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

          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'border-gold-500 text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge ? (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                        active ? `${accent.bg} ${accent.onAccent}` : 'bg-sunken text-muted'
                      }`}
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
        {/* ===== Presentación ===== */}
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
          {/* ===== Catálogo ===== */}
          {activeTab === 'catalog' && (
            <section className="tab-enter space-y-5">
              <div className="panel space-y-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Buscar por descripción, código o modelo…"
                      aria-label="Buscar en el catálogo"
                      className="field pl-9"
                    />
                  </div>
                  <div className="inline-flex shrink-0 self-start rounded-lg border border-line p-0.5">
                    <button
                      onClick={() => setViewMode('list')}
                      className={viewButton(viewMode === 'list')}
                      aria-label="Vista de lista"
                      aria-pressed={viewMode === 'list'}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={viewButton(viewMode === 'grid')}
                      aria-label="Vista en cuadrícula"
                      aria-pressed={viewMode === 'grid'}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Familias: primer nivel de navegación */}
                <div className="border-t border-line pt-4">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Familias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedGroup(null);
                        setSelectedCategory(null);
                      }}
                      className={groupChip(!selectedGroup)}
                    >
                      Todas
                      <span className={!selectedGroup ? 'text-white/70' : 'text-muted'}>
                        {formatCount(products.length)}
                      </span>
                    </button>
                    {groups.map(group => (
                      <button
                        key={group.name}
                        onClick={() => {
                          setSelectedGroup(group.name);
                          setSelectedCategory(null);
                        }}
                        className={groupChip(selectedGroup === group.name)}
                      >
                        {group.name}
                        <span className={selectedGroup === group.name ? 'text-white/70' : 'text-muted'}>
                          {formatCount(
                            group.categories.reduce(
                              (total, category) => total + (productsByCategory.get(category) ?? 0),
                              0
                            )
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Segundo nivel: las categorías de la familia elegida */}
                {activeGroup && (
                  <div className="border-t border-line pt-4">
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {activeGroup.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={categoryChip(!selectedCategory)}
                      >
                        Todas las líneas
                      </button>
                      {activeGroup.categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={categoryChip(selectedCategory === category)}
                        >
                          {category}
                          <span className="text-muted">{productsByCategory.get(category) ?? 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:underline dark:text-navy-300"
                  >
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </button>
                )}
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
                <div className="panel divide-y divide-line overflow-hidden">
                  {visibleProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-sunken/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="font-mono font-medium">{product.id}</span>
                          <span className="truncate">{product.category}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-medium leading-snug text-ink">
                          {product.name}
                        </p>
                        {product.model && (
                          <p className="mt-0.5 text-xs text-muted">Modelo {product.model}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <AvailabilityBadge available={product.stock > 0} />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="rounded-md border border-line px-2.5 py-1.5 text-muted transition-colors hover:border-navy-400 hover:text-ink"
                            aria-label={`Ver detalle de ${product.name}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => addToQuote(product)}
                            className={`rounded-md px-2.5 py-1.5 transition-colors ${accent.bg} ${accent.bgHover} ${accent.onAccent}`}
                            aria-label={`Agregar ${product.name} a la solicitud`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map(product => (
                    <article
                      key={product.id}
                      className="panel flex flex-col p-4 transition-shadow hover:shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-medium text-muted">{product.id}</span>
                        <AvailabilityBadge available={product.stock > 0} />
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink">
                          {product.name}
                        </h3>
                        <p className="mt-2 truncate text-xs text-muted">{product.category}</p>
                        {product.model && (
                          <p className="mt-0.5 truncate text-xs text-muted">Modelo {product.model}</p>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-line pt-3">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="btn-ghost flex-1"
                        >
                          <Eye className="h-4 w-4" /> Detalle
                        </button>
                        <button
                          onClick={() => addToQuote(product)}
                          className={`rounded-lg px-3 py-2 transition-colors ${accent.bg} ${accent.bgHover} ${accent.onAccent}`}
                          aria-label={`Agregar ${product.name} a la solicitud`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {visibleProducts.length < filteredProducts.length && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                    className="btn-ghost px-5 py-2.5"
                  >
                    Cargar más referencias
                    <span className="text-muted">
                      ({formatCount(filteredProducts.length - visibleProducts.length)} restantes)
                    </span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ===== Solicitud de cotización ===== */}
          {activeTab === 'quote' && (
            <section className="tab-enter grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="panel p-5">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                  <h2 className="flex items-center gap-2 font-bold tracking-tight text-ink">
                    <ClipboardList className="h-5 w-5 text-muted" /> Productos solicitados
                  </h2>
                  {quoteItems.length > 0 && (
                    <button
                      onClick={() => setQuoteItems([])}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline dark:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Vaciar lista
                    </button>
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

      {/* ===== Pie de página ===== */}
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
          className={`toast-enter fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border bg-elevated px-4 py-3 text-sm shadow-lift ${
            notification.type === 'error'
              ? 'border-rose-600/40 text-rose-700 dark:text-rose-300'
              : notification.type === 'info'
                ? 'border-line text-ink'
                : 'border-emerald-600/40 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
