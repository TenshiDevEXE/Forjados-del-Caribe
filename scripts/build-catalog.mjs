// Generador del catálogo estático.
//
// Lee content/catalog.json (única fuente de verdad), valida su integridad y
// escribe lib/catalog.generated.ts, que se incluye en el bundle de la web.
//
// La web es exclusivamente un catálogo: los precios se negocian por WhatsApp y
// nunca se publican. Por eso, si aparece cualquier campo que suene a precio,
// el build falla y no se genera nada.
//
// Uso: npm run catalog   (también forma parte de npm run build)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = join(ROOT, 'content', 'catalog.json');
const TARGET_PATH = join(ROOT, 'lib', 'catalog.generated.ts');

const LOGO_TYPES = ['wrench', 'hammer', 'shield', 'cpu', 'hardhat', 'box'];
const ACCENT_COLORS = ['amber', 'emerald', 'blue', 'violet', 'rose'];
const THEMES = ['dark', 'light'];

// Claves prohibidas, normalizadas (minúsculas y sin separadores).
const FORBIDDEN_KEYS = new Set(
  [
    'price', 'prices', 'precio', 'precios',
    'cost', 'costs', 'coste', 'costes', 'costo', 'costos',
    'purchase_price', 'sale_price', 'purchasePrice', 'salePrice',
    'unit_price', 'unitPrice', 'list_price', 'listPrice',
    'retail_price', 'retailPrice', 'wholesale_price', 'wholesalePrice', 'msrp',
  ].map(normalizeKey)
);

// Campos aceptados por cada entidad. Cualquier otro campo es un error.
const SCHEMAS = {
  config: ['name', 'slogan', 'logoType', 'accentColor', 'footerText', 'contactPhones', 'contactEmail', 'address', 'defaultTheme'],
  contactPhones: ['label', 'phone'],
  categories: ['id', 'name'],
  subcategories: ['id', 'name', 'categoryId'],
  products: ['id', 'sku', 'name', 'brand', 'model', 'categoryId', 'subcategoryId', 'stock', 'description', 'image'],
};

function normalizeKey(key) {
  return key.toLowerCase().replace(/[\s_-]/g, '');
}

function rel(path) {
  return relative(ROOT, path).replace(/\\/g, '/');
}

class ValidationError extends Error {}

/* ==================== Validación ==================== */

function checkKeys(obj, allowed, where, errors) {
  for (const key of Object.keys(obj)) {
    const normalized = normalizeKey(key);

    if (FORBIDDEN_KEYS.has(normalized)) {
      errors.push(
        `${where}: el campo "${key}" es un precio. La web no publica precios nunca; elimínalo del catálogo.`
      );
      continue;
    }

    if (!allowed.includes(key)) {
      errors.push(`${where}: campo desconocido "${key}". Permitidos: ${allowed.join(', ')}.`);
    }
  }
}

function requireString(obj, field, where, errors) {
  const value = obj[field];
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${where}: falta "${field}" o está vacío.`);
    return '';
  }
  return value.trim();
}

function requireEnum(obj, field, allowed, where, errors) {
  const value = obj[field];
  if (!allowed.includes(value)) {
    errors.push(`${where}: "${field}" debe ser uno de: ${allowed.join(', ')}.`);
  }
}

function validate(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('La raíz de content/catalog.json debe ser un objeto.');
  }

  checkKeys(data, ['config', 'categories', 'subcategories', 'products'], 'catálogo', errors);

  for (const section of ['categories', 'subcategories', 'products']) {
    if (!Array.isArray(data[section])) {
      errors.push(`catálogo: "${section}" debe ser una lista.`);
    }
  }
  if (!data.config || typeof data.config !== 'object' || Array.isArray(data.config)) {
    errors.push('catálogo: falta el objeto "config".');
  }
  if (errors.length) throw new ValidationError(errors.join('\n'));

  const { config, categories, subcategories, products } = data;

  /* -------- config -------- */
  checkKeys(config, SCHEMAS.config, 'config', errors);
  requireString(config, 'name', 'config', errors);
  if (config.logoType !== undefined) requireEnum(config, 'logoType', LOGO_TYPES, 'config', errors);
  if (config.accentColor !== undefined) requireEnum(config, 'accentColor', ACCENT_COLORS, 'config', errors);
  if (config.defaultTheme !== undefined) requireEnum(config, 'defaultTheme', THEMES, 'config', errors);

  // contactPhones: al menos un número; el primero es el principal.
  if (!Array.isArray(config.contactPhones) || config.contactPhones.length === 0) {
    errors.push('config: "contactPhones" debe ser una lista con al menos un número de WhatsApp.');
  } else {
    config.contactPhones.forEach((entry, index) => {
      const where = `config.contactPhones[${index}]`;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(`${where}: debe ser un objeto con "phone" (y opcionalmente "label").`);
        return;
      }
      checkKeys(entry, SCHEMAS.contactPhones, where, errors);
      requireString(entry, 'phone', where, errors);
    });
  }

  /* -------- categorías y subcategorías -------- */
  const categoryIds = new Set();
  categories.forEach((category, index) => {
    const where = `categories[${index}]`;
    checkKeys(category, SCHEMAS.categories, where, errors);
    const id = requireString(category, 'id', where, errors);
    requireString(category, 'name', where, errors);
    if (id && categoryIds.has(id)) errors.push(`${where}: el id "${id}" está repetido.`);
    categoryIds.add(id);
  });

  const subcategoryIds = new Map();
  subcategories.forEach((subcategory, index) => {
    const where = `subcategories[${index}]`;
    checkKeys(subcategory, SCHEMAS.subcategories, where, errors);
    const id = requireString(subcategory, 'id', where, errors);
    requireString(subcategory, 'name', where, errors);
    const categoryId = requireString(subcategory, 'categoryId', where, errors);
    if (id && subcategoryIds.has(id)) errors.push(`${where}: el id "${id}" está repetido.`);
    if (categoryId && !categoryIds.has(categoryId)) {
      errors.push(`${where}: apunta a la categoría "${categoryId}", que no existe.`);
    }
    subcategoryIds.set(id, categoryId);
  });

  /* -------- productos -------- */
  const skus = new Set();
  const productIds = new Set();

  products.forEach((product, index) => {
    const where = `products[${index}]`;
    checkKeys(product, SCHEMAS.products, where, errors);

    const id = requireString(product, 'id', where, errors);
    const sku = requireString(product, 'sku', where, errors);
    requireString(product, 'name', where, errors);
    const categoryId = requireString(product, 'categoryId', where, errors);

    if (id && productIds.has(id)) errors.push(`${where}: el id "${id}" está repetido.`);
    productIds.add(id);
    if (sku && skus.has(sku)) errors.push(`${where}: el SKU "${sku}" está repetido.`);
    skus.add(sku);

    if (categoryId && !categoryIds.has(categoryId)) {
      errors.push(`${where}: apunta a la categoría "${categoryId}", que no existe.`);
    }

    const subcategoryId = product.subcategoryId ?? null;
    if (subcategoryId !== null) {
      if (typeof subcategoryId !== 'string' || !subcategoryId.trim()) {
        errors.push(`${where}: "subcategoryId" debe ser un id o null.`);
      } else if (!subcategoryIds.has(subcategoryId)) {
        errors.push(`${where}: apunta a la subcategoría "${subcategoryId}", que no existe.`);
      } else if (categoryId && subcategoryIds.get(subcategoryId) !== categoryId) {
        errors.push(
          `${where}: la subcategoría "${subcategoryId}" pertenece a "${subcategoryIds.get(subcategoryId)}", no a "${categoryId}".`
        );
      }
    }

    if (product.stock !== undefined && !Number.isFinite(Number(product.stock))) {
      errors.push(`${where}: "stock" debe ser un número.`);
    }
  });

  if (errors.length) throw new ValidationError(errors.join('\n'));

  return { config, categories, subcategories, products };
}

/* ==================== Generación ==================== */

function toProduct(product, categoryNames, subcategoryNames) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    brand: (product.brand ?? '').trim(),
    model: (product.model ?? '').trim(),
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId ?? null,
    categoryName: categoryNames.get(product.categoryId) ?? 'Sin categoría',
    subcategoryName: product.subcategoryId
      ? subcategoryNames.get(product.subcategoryId) ?? null
      : null,
    stock: Number(product.stock) || 0,
    description: (product.description ?? '').trim(),
    image: (product.image ?? '').trim(),
  };
}

function toConfig(config) {
  return {
    name: config.name.trim(),
    slogan: (config.slogan ?? '').trim(),
    logoType: config.logoType ?? 'wrench',
    accentColor: config.accentColor ?? 'amber',
    footerText: (config.footerText ?? '').trim(),
    contactPhones: config.contactPhones.map((entry, index) => ({
      label: (entry.label ?? '').trim() || `WhatsApp ${index + 1}`,
      phone: String(entry.phone).trim(),
    })),
    contactEmail: (config.contactEmail ?? '').trim(),
    address: (config.address ?? '').trim(),
    theme: config.defaultTheme === 'light' ? 'light' : 'dark',
  };
}

function render(data) {
  const categoryNames = new Map(data.categories.map(c => [c.id, c.name]));
  const subcategoryNames = new Map(data.subcategories.map(s => [s.id, s.name]));

  const config = toConfig(data.config);
  const categories = data.categories.map(c => ({ id: c.id, name: c.name }));
  const subcategories = data.subcategories.map(s => ({
    id: s.id,
    name: s.name,
    categoryId: s.categoryId,
  }));
  const products = data.products.map(p => toProduct(p, categoryNames, subcategoryNames));

  const literal = (name, type, value) =>
    `export const ${name}: ${type} = ${JSON.stringify(value, null, 2)};\n`;

  return `// ARCHIVO GENERADO — NO EDITAR A MANO.
// Fuente: content/catalog.json · Generador: scripts/build-catalog.mjs
// Este catálogo no contiene precios por diseño: se solicitan por WhatsApp.

import type { Category, Product, StoreConfig, Subcategory } from './types';

${literal('CATALOG_CONFIG', 'StoreConfig', config)}
${literal('CATALOG_CATEGORIES', 'Category[]', categories)}
${literal('CATALOG_SUBCATEGORIES', 'Subcategory[]', subcategories)}
${literal('CATALOG_PRODUCTS', 'Product[]', products)}`;
}

/* ==================== Ejecución ==================== */

let raw;
try {
  raw = readFileSync(SOURCE_PATH, 'utf8');
} catch {
  console.error(`No se pudo leer ${rel(SOURCE_PATH)}.`);
  process.exit(1);
}

let data;
try {
  data = validate(JSON.parse(raw));
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`${rel(SOURCE_PATH)} no es un JSON válido: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.error(`El catálogo no es válido:\n${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
}

writeFileSync(TARGET_PATH, render(data), 'utf8');
console.log(
  `Catálogo generado: ${data.products.length} productos, ` +
    `${data.categories.length} categorías, ${data.subcategories.length} subcategorías → ${rel(TARGET_PATH)}`
);
