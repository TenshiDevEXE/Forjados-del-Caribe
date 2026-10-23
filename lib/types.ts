/* ==================== Tipos del catálogo estático ==================== */
// La web es un catálogo: no existen precios en el modelo de datos.
// La fuente de verdad es public/catalog.json (ver scripts/import-inventory.mjs).

export type LogoType = 'wrench' | 'hammer' | 'shield' | 'cpu' | 'hardhat' | 'box';
// Acentos corporativos: el dorado apagado es el de la marca y el azul marino
// actúa como estructura (cabecera, pie, filtros activos).
export type AccentColor = 'gold' | 'navy' | 'emerald';
export type Theme = 'dark' | 'light';
export type TabId = 'catalog' | 'quote';

// Producto del inventario. Las categorías son texto libre (no hay subcategorías).
export interface Product {
  id: string;
  name: string;
  category: string;
  model?: string;
  stock: number;
}

// Número de WhatsApp al que se pueden enviar las solicitudes de cotización.
// El primero de la lista es el principal.
export interface ContactPhone {
  label: string;
  phone: string;
}

// Teléfono de la compañía (contacto general).
export interface StoreConfig {
  name: string;
  slogan: string;
  logoType: LogoType;
  accentColor: AccentColor;
  footerText: string;
  contactPhone: string;
  contactPhones: ContactPhone[];
  contactEmail: string;
  address: string;
  theme: Theme;
}

// Contenido completo de public/catalog.json.
export interface Catalog {
  config: StoreConfig;
  categories: string[];
  products: Product[];
}

export interface Notification {
  message: string;
  type: 'info' | 'success' | 'error';
}

// Clases de Tailwind por color de acento (estáticas para que el purge las conserve)
export interface AccentStyles {
  bg: string;
  bgHover: string;
  // Texto legible sobre "bg"
  onAccent: string;
  text: string;
  softBg: string;
  border: string;
  gradient: string;
  ring: string;
}

export interface QuoteItem {
  product: Product;
  quantity: number;
}
