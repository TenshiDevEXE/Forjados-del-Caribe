// Validador del catálogo estático.
//
// Comprueba public/catalog.json (generado por scripts/import-inventory.mjs) y
// aborta el build si algo está mal. La web es exclusivamente un catálogo: los
// precios se negocian por WhatsApp y nunca se publican, así que cualquier campo
// que suene a precio es un error que detiene la compilación.
//
// Uso: npm run catalog   (también forma parte de npm run build y npm test)

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_PATH = join(ROOT, 'public', 'catalog.json');

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
  config: ['name', 'slogan', 'logoType', 'accentColor', 'footerText', 'contactPhone', 'contactPhones', 'contactEmail', 'address', 'theme'],
  contactPhones: ['label', 'phone'],
  products: ['id', 'name', 'category', 'model', 'stock'],
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
    throw new ValidationError('La raíz de public/catalog.json debe ser un objeto.');
  }

  checkKeys(data, ['config', 'categories', 'products'], 'catálogo', errors);

  for (const section of ['categories', 'products']) {
    if (!Array.isArray(data[section])) {
      errors.push(`catálogo: "${section}" debe ser una lista.`);
    }
  }
  if (!data.config || typeof data.config !== 'object' || Array.isArray(data.config)) {
    errors.push('catálogo: falta el objeto "config".');
  }
  if (errors.length) throw new ValidationError(errors.join('\n'));

  const { config, categories, products } = data;

  /* -------- config -------- */
  checkKeys(config, SCHEMAS.config, 'config', errors);
  requireString(config, 'name', 'config', errors);
  if (config.logoType !== undefined) requireEnum(config, 'logoType', LOGO_TYPES, 'config', errors);
  if (config.accentColor !== undefined) requireEnum(config, 'accentColor', ACCENT_COLORS, 'config', errors);
  if (config.theme !== undefined) requireEnum(config, 'theme', THEMES, 'config', errors);

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

  /* -------- categorías -------- */
  const categoryNames = new Set();
  categories.forEach((category, index) => {
    const where = `categories[${index}]`;
    if (typeof category !== 'string' || !category.trim()) {
      errors.push(`${where}: cada categoría debe ser un texto no vacío.`);
      return;
    }
    if (categoryNames.has(category)) errors.push(`${where}: la categoría "${category}" está repetida.`);
    categoryNames.add(category);
  });

  /* -------- productos -------- */
  const productIds = new Set();

  products.forEach((product, index) => {
    const where = `products[${index}]`;
    checkKeys(product, SCHEMAS.products, where, errors);

    const id = requireString(product, 'id', where, errors);
    requireString(product, 'name', where, errors);
    const category = requireString(product, 'category', where, errors);

    if (id && productIds.has(id)) errors.push(`${where}: el id "${id}" está repetido.`);
    productIds.add(id);

    if (category && !categoryNames.has(category)) {
      errors.push(`${where}: usa la categoría "${category}", que no está en la lista.`);
    }

    if (!Number.isFinite(Number(product.stock))) {
      errors.push(`${where}: "stock" debe ser un número.`);
    }
    if (product.model !== undefined && typeof product.model !== 'string') {
      errors.push(`${where}: "model" debe ser un texto.`);
    }
  });

  if (errors.length) throw new ValidationError(errors.join('\n'));

  return { config, categories, products };
}

/* ==================== Ejecución ==================== */

let raw;
try {
  raw = readFileSync(CATALOG_PATH, 'utf8');
} catch {
  console.error(`No se pudo leer ${rel(CATALOG_PATH)}. Genera el catálogo con: npm run import -- "ruta/al/inventario.xls"`);
  process.exit(1);
}

let data;
try {
  data = validate(JSON.parse(raw));
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`${rel(CATALOG_PATH)} no es un JSON válido: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.error(`El catálogo no es válido:\n${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
}

console.log(
  `Catálogo válido: ${data.products.length} productos, ${data.categories.length} categorías, sin precios.`
);
