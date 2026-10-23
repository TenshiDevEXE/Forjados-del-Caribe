// Datos del catálogo.
//
// La web es 100% estática: no hay backend ni peticiones de red. Los datos se
// generan en el build a partir de content/catalog.json (scripts/build-catalog.mjs)
// y viajan dentro del bundle. Al no existir precios en el origen, es imposible
// que se filtren al cliente.

export {
  CATALOG_CONFIG as config,
  CATALOG_CATEGORIES as categories,
  CATALOG_SUBCATEGORIES as subcategories,
  CATALOG_PRODUCTS as products,
} from './catalog.generated';
