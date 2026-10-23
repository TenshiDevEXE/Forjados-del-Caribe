#!/usr/bin/env node
/**
 * Importa el inventario exportado del sistema (XLS, XLSX o CSV) y regenera
 * el catálogo público en public/catalog.json.
 *
 * Uso:
 *   node scripts/import-inventory.mjs "E:\data\Archivo.XLS"
 *   node scripts/import-inventory.mjs inventario.csv --out public/catalog.json
 *
 * Reglas:
 *   - Los precios NUNCA se importan: solo se leen las columnas de código,
 *     descripción, categoría, referencia de proveedor y existencia.
 *   - La sección "config" (nombre, teléfonos, tema) se conserva tal cual.
 *   - El resultado se valida antes de escribirse: si algún producto tuviera
 *     un campo que suene a precio, el script aborta sin tocar el catálogo.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Campos que puede tener un producto del catálogo. Nada más se escribe.
const PRODUCT_KEYS = ['id', 'name', 'category', 'model', 'stock'];

// Cualquier campo que suene a precio aborta la importación.
const PRICE_PATTERN = /price|precio|cost|coste|costo|sale|purchase|importe|tarifa|valor|monto|descuento/i;

const SOFFICE_CANDIDATES = [
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
  'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  '/usr/bin/soffice',
  '/usr/local/bin/soffice',
  'soffice',
];

function findSoffice() {
  for (const candidate of SOFFICE_CANDIDATES) {
    if (candidate === 'soffice') return candidate;
    if (fs.existsSync(candidate)) return candidate;
  }
  return 'soffice';
}

/** Convierte una hoja de cálculo a CSV (UTF-8, separador ';') con LibreOffice. */
function spreadsheetToCsv(input) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalogo-'));
  const profile = workDir.replace(/\\/g, '/');

  execFileSync(
    findSoffice(),
    [
      '--headless',
      `-env:UserInstallation=file:///${profile}/profile`,
      '--convert-to',
      'csv:Text - txt - csv (StarCalc):59,34,76,1',
      '--outdir',
      workDir,
      input,
    ],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );

  const csvPath = path.join(workDir, `${path.basename(input).replace(/\.[^.]+$/, '')}.csv`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`LibreOffice no generó el CSV de ${input}. ¿Está instalado y el archivo no está protegido?`);
  }
  return csvPath;
}

/** Parser CSV conforme a RFC 4180. Detecta ';' o ',' como separador. */
function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Normaliza un encabezado: sin acentos, minúsculas, sin espacios sobrantes. */
function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function detectDelimiter(text) {
  const firstLine = text.slice(0, text.indexOf('\n') === -1 ? text.length : text.indexOf('\n'));
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ';' : ',';
}

/** Localiza los índices de las columnas que nos interesan. */
function mapColumns(header) {
  const normalized = header.map(normalize);
  const find = (predicate) => normalized.findIndex(predicate);

  const columns = {
    id: find((name) => name === 'codigo'),
    name: find((name) => name.startsWith('descripcion')),
    category: find((name) => name === 'categoria'),
    model: find((name) => name.startsWith('ref') && name.includes('proveedor')),
    stock: find((name) => name === 'existencia'),
  };

  const missing = Object.entries(columns)
    .filter(([key, index]) => index === -1 && key !== 'model')
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `No encuentro estas columnas en el archivo: ${missing.join(', ')}.\n` +
        `Encabezados leídos: ${header.join(' | ')}`
    );
  }
  return columns;
}

/** Convierte a entero la existencia. Negativos y no numéricos cuentan como 0. */
function parseStock(raw) {
  const value = Number.parseInt(String(raw ?? '').replace(/[^\d-]/g, ''), 10);
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function toProducts(rows, columns) {
  const products = [];
  const seen = new Set();
  let skippedEmpty = 0;
  let skippedDuplicate = 0;

  for (const row of rows) {
    const id = String(row[columns.id] ?? '').trim();
    const name = String(row[columns.name] ?? '').trim();

    if (!id || !name || !/^\d+$/.test(id)) {
      skippedEmpty += 1;
      continue;
    }
    if (seen.has(id)) {
      skippedDuplicate += 1;
      continue;
    }
    seen.add(id);

    const category = String(row[columns.category] ?? '').trim();
    const model = columns.model === -1 ? '' : String(row[columns.model] ?? '').trim();

    const product = {
      id,
      name,
      category: category || 'Sin categoría',
    };
    if (model) product.model = model;
    product.stock = parseStock(row[columns.stock]);

    products.push(product);
  }

  return { products, skippedEmpty, skippedDuplicate };
}

/** Recorta la lista de categorías a las que realmente usa algún producto. */
function buildCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
}

/** Última barrera: ningún producto puede salir con un campo prohibido. */
function assertNoPrices(products) {
  for (const product of products) {
    for (const key of Object.keys(product)) {
      if (!PRODUCT_KEYS.includes(key)) {
        throw new Error(`El producto ${product.id} tiene el campo inesperado "${key}".`);
      }
      if (PRICE_PATTERN.test(key)) {
        throw new Error(`El producto ${product.id} tiene el campo "${key}", que es un precio.`);
      }
    }
  }
}

function loadConfig(outputPath) {
  const legacyPath = path.join(ROOT, 'content', 'catalog.json');
  for (const candidate of [outputPath, legacyPath]) {
    if (!fs.existsSync(candidate)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      if (parsed?.config) return normalizeConfig(parsed.config);
    } catch {
      // Si el catálogo actual no se puede leer, se usa el de por defecto.
    }
  }
  return null;
}

/** Unifica el nombre del campo del tema (antes "defaultTheme") con el del catálogo. */
function normalizeConfig(config) {
  const { defaultTheme, ...rest } = config;
  if (rest.theme === undefined && defaultTheme) rest.theme = defaultTheme;
  return rest;
}

function main() {
  const args = process.argv.slice(2);
  const input = args.find((arg) => !arg.startsWith('--'));
  const outIndex = args.indexOf('--out');
  const outputPath =
    outIndex === -1 ? path.join(ROOT, 'public', 'catalog.json') : path.resolve(args[outIndex + 1]);

  if (!input) {
    console.error('Uso: node scripts/import-inventory.mjs <archivo XLS|XLSX|CSV> [--out public/catalog.json]');
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error(`No existe el archivo: ${input}`);
    process.exit(1);
  }

  const config = loadConfig(outputPath);
  if (!config) {
    console.error('No encuentro la sección "config" del catálogo actual. Ejecuta primero una importación con un public/catalog.json existente.');
    process.exit(1);
  }

  const extension = path.extname(input).toLowerCase();
  console.log(`Leyendo ${input}...`);
  const csvPath = extension === '.csv' ? input : spreadsheetToCsv(input);

  const text = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(text, detectDelimiter(text));

  const header = rows.shift() ?? [];
  const columns = mapColumns(header);

  const { products, skippedEmpty, skippedDuplicate } = toProducts(rows, columns);
  assertNoPrices(products);

  const categories = buildCategories(products);
  const catalog = { config, categories, products };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  const inStock = products.filter((product) => product.stock > 0).length;
  const sizeKb = Math.round(fs.statSync(outputPath).size / 1024);

  console.log('');
  console.log(`Productos importados : ${products.length}`);
  console.log(`En existencia        : ${inStock}`);
  console.log(`Categorías           : ${categories.length}`);
  console.log(`Filas descartadas    : ${skippedEmpty} (vacías o sin código) y ${skippedDuplicate} (código repetido)`);
  console.log(`Precios importados   : 0 (se descartan por diseño)`);
  console.log(`Escrito              : ${path.relative(ROOT, outputPath)} (${sizeKb} KB)`);
}

main();
