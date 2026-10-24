import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_PATH = path.join(ROOT, 'public', 'catalog.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'products');

function main() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('No se encontró public/catalog.json');
    process.exit(1);
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('No se encontró public/images/products/');
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.products || [];

  const files = fs.readdirSync(IMAGES_DIR);
  const fileMap = new Map();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) continue;
    const base = path.basename(file, ext);
    fileMap.set(base, `images/products/${file}`);
  }

  let matched = 0;
  let updated = 0;

  for (const product of products) {
    if (product.image) continue;
    const relPath = fileMap.get(product.id);
    if (relPath) {
      product.image = relPath;
      matched++;
      updated++;
    }
  }

  if (updated > 0) {
    fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
    console.log(`Actualizados: ${updated} productos con imagen`);
  } else {
    console.log('Sin cambios. Productos con imagen ya existentes o sin coincidencias.');
  }
  console.log(`Archivos en images/products: ${fileMap.size}, productos con imagen: ${products.filter(p => p.image).length}`);
}

main();
