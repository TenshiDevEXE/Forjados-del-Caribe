// Acceso a los datos del catálogo.
//
// La web es 100% estática: no hay backend. El catálogo (public/catalog.json) se
// carga en tiempo de ejecución con fetch, porque son miles de productos y no
// conviene empaquetarlos dentro del bundle de JavaScript.
//
// Al no existir precios en el origen (scripts/import-inventory.mjs los descarta),
// es imposible que se filtren al cliente.

import type { Catalog } from './types';

// Ruta relativa: funciona igual en la raíz de un dominio o en un subdirectorio.
const CATALOG_URL = 'catalog.json';

export async function loadCatalog(signal?: AbortSignal): Promise<Catalog> {
  const response = await fetch(CATALOG_URL, { signal });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as Catalog;
  if (!data?.config || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error('El catálogo tiene un formato inesperado.');
  }
  return data;
}
