/* ==================== Tipos del catálogo estático ==================== */
// La web es un catálogo: no existen precios en el modelo de datos.
// Ver content/catalog.json (fuente de verdad) y scripts/build-catalog.mjs.

export type LogoType = 'wrench' | 'hammer' | 'shield' | 'cpu' | 'hardhat' | 'box';
export type AccentColor = 'amber' | 'emerald' | 'blue' | 'violet' | 'rose';
export type Theme = 'dark' | 'light';
export type TabId = 'catalog' | 'quote';

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  subcategoryId: string | null;
  categoryName: string;
  subcategoryName: string | null;
  stock: number;
  description: string;
  image: string;
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

export interface Notification {
  message: string;
  type: 'info' | 'success' | 'error';
}

// Clases de Tailwind por color de acento (estáticas para que el purge las conserve)
export interface AccentStyles {
  bg: string;
  bgHover: string;
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
