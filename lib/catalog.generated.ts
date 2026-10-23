// ARCHIVO GENERADO — NO EDITAR A MANO.
// Fuente: content/catalog.json · Generador: scripts/build-catalog.mjs
// Este catálogo no contiene precios por diseño: se solicitan por WhatsApp.

import type { Category, Product, StoreConfig, Subcategory } from './types';

export const CATALOG_CONFIG: StoreConfig = {
  "name": "Forjados Del Caribe SRL",
  "slogan": "Suministros Ferreteros y Equipamiento Pesado",
  "logoType": "wrench",
  "accentColor": "amber",
  "footerText": "© 2026 Forjados Del Caribe SRL.",
  "contactPhone": "+18092272492",
  "contactPhones": [
    {
      "label": "Ventas",
      "phone": "+18496263154"
    }
  ],
  "contactEmail": "contacto@ferrotech.com",
  "address": "Av. Industrial N-4500",
  "theme": "dark"
};

export const CATALOG_CATEGORIES: Category[] = [
  {
    "id": "cat-1",
    "name": "Herramientas Manuales"
  },
  {
    "id": "cat-2",
    "name": "Herramientas Eléctricas"
  },
  {
    "id": "cat-3",
    "name": "Equipamiento de Seguridad"
  },
  {
    "id": "cat-4",
    "name": "Accesorios Ferreteros"
  },
  {
    "id": "cat-5",
    "name": "Iluminación"
  },
  {
    "id": "cat-6",
    "name": "Cables y Conductores"
  }
];

export const CATALOG_SUBCATEGORIES: Subcategory[] = [
  {
    "id": "sub-1",
    "name": "Destornilladores",
    "categoryId": "cat-1"
  },
  {
    "id": "sub-2",
    "name": "Llaves",
    "categoryId": "cat-1"
  },
  {
    "id": "sub-3",
    "name": "Martillos",
    "categoryId": "cat-1"
  },
  {
    "id": "sub-4",
    "name": "Taladros",
    "categoryId": "cat-2"
  },
  {
    "id": "sub-5",
    "name": "Sierras",
    "categoryId": "cat-2"
  },
  {
    "id": "sub-6",
    "name": "EPP Personal",
    "categoryId": "cat-3"
  },
  {
    "id": "sub-7",
    "name": "Tornillos",
    "categoryId": "cat-4"
  },
  {
    "id": "sub-8",
    "name": "Fijaciones",
    "categoryId": "cat-4"
  },
  {
    "id": "sub-9",
    "name": "LED",
    "categoryId": "cat-5"
  },
  {
    "id": "sub-10",
    "name": "Cables Eléctricos",
    "categoryId": "cat-6"
  }
];

export const CATALOG_PRODUCTS: Product[] = [
  {
    "id": "prod-1",
    "sku": "HM-001",
    "name": "Destornillador Phillips 6x100mm",
    "brand": "Stanley",
    "model": "PH-6-100",
    "categoryId": "cat-1",
    "subcategoryId": "sub-1",
    "categoryName": "Herramientas Manuales",
    "subcategoryName": "Destornilladores",
    "stock": 150,
    "description": "Destornillador Phillips de punta magnética, mango ergonómico de goma, cromado.",
    "image": ""
  },
  {
    "id": "prod-2",
    "sku": "HM-002",
    "name": "Llave Inglesa 10\"",
    "brand": "Truper",
    "model": "LI-10",
    "categoryId": "cat-1",
    "subcategoryId": "sub-2",
    "categoryName": "Herramientas Manuales",
    "subcategoryName": "Llaves",
    "stock": 80,
    "description": "Llave inglesa ajustable, 10 pulgadas, acero forjado, cromada.",
    "image": ""
  },
  {
    "id": "prod-3",
    "sku": "HM-003",
    "name": "Martillo Carpintero 16oz",
    "brand": "Estwing",
    "model": "E3-16C",
    "categoryId": "cat-1",
    "subcategoryId": "sub-3",
    "categoryName": "Herramientas Manuales",
    "subcategoryName": "Martillos",
    "stock": 60,
    "description": "Martillo de carpintero, 16oz, cabeza de acero forjado, mango de fibra de vidrio.",
    "image": ""
  },
  {
    "id": "prod-4",
    "sku": "HE-001",
    "name": "Taladro Percutor 18V",
    "brand": "DeWalt",
    "model": "DCD777C2",
    "categoryId": "cat-2",
    "subcategoryId": "sub-4",
    "categoryName": "Herramientas Eléctricas",
    "subcategoryName": "Taladros",
    "stock": 25,
    "description": "Taladro percutor inalámbrico 18V, 2 velocidades, batería incluida.",
    "image": ""
  },
  {
    "id": "prod-5",
    "sku": "HE-002",
    "name": "Sierra Circular 7-1/4\"",
    "brand": "Makita",
    "model": "5007M",
    "categoryId": "cat-2",
    "subcategoryId": "sub-5",
    "categoryName": "Herramientas Eléctricas",
    "subcategoryName": "Sierras",
    "stock": 15,
    "description": "Sierra circular 7-1/4\", 15A, 5200 RPM, base de aluminio.",
    "image": ""
  },
  {
    "id": "prod-6",
    "sku": "ES-001",
    "name": "Casco de Seguridad",
    "brand": "3M",
    "model": "H-700",
    "categoryId": "cat-3",
    "subcategoryId": "sub-6",
    "categoryName": "Equipamiento de Seguridad",
    "subcategoryName": "EPP Personal",
    "stock": 200,
    "description": "Casco de seguridad ABS, ajustable, con bandas de sudor.",
    "image": ""
  },
  {
    "id": "prod-7",
    "sku": "ES-002",
    "name": "Guantes de Cuero",
    "brand": "Ansell",
    "model": "GP-401",
    "categoryId": "cat-3",
    "subcategoryId": "sub-6",
    "categoryName": "Equipamiento de Seguridad",
    "subcategoryName": "EPP Personal",
    "stock": 300,
    "description": "Guantes de cuero curtido, reforzados en palma, costuras dobles.",
    "image": ""
  },
  {
    "id": "prod-8",
    "sku": "AF-001",
    "name": "Tornillo Hex 1/2\" x 1\" (Paca 100)",
    "brand": "Grip-Rite",
    "model": "TH-120",
    "categoryId": "cat-4",
    "subcategoryId": "sub-7",
    "categoryName": "Accesorios Ferreteros",
    "subcategoryName": "Tornillos",
    "stock": 500,
    "description": "Tornillo hexagonal 1/2\" x 1\", zincado, paca de 100 unidades.",
    "image": ""
  },
  {
    "id": "prod-9",
    "sku": "AF-002",
    "name": "Arandela Plana 1/2\" (Paca 200)",
    "brand": "Grip-Rite",
    "model": "AR-120",
    "categoryId": "cat-4",
    "subcategoryId": "sub-8",
    "categoryName": "Accesorios Ferreteros",
    "subcategoryName": "Fijaciones",
    "stock": 600,
    "description": "Arandela plana 1/2\", acero, paca de 200 unidades.",
    "image": ""
  },
  {
    "id": "prod-10",
    "sku": "IL-001",
    "name": "Foco LED 10W",
    "brand": "Philips",
    "model": "LED-10W",
    "categoryId": "cat-5",
    "subcategoryId": "sub-9",
    "categoryName": "Iluminación",
    "subcategoryName": "LED",
    "stock": 400,
    "description": "Foco LED 10W, luz blanca 4000K, E27, ahorro de energía.",
    "image": ""
  },
  {
    "id": "prod-11",
    "sku": "CC-001",
    "name": "Cable THHN 12AWG (Metro)",
    "brand": "Southwire",
    "model": "THHN-12",
    "categoryId": "cat-6",
    "subcategoryId": "sub-10",
    "categoryName": "Cables y Conductores",
    "subcategoryName": "Cables Eléctricos",
    "stock": 1000,
    "description": "Cable THHN 12AWG, 600V, por metro, colores variados.",
    "image": ""
  },
  {
    "id": "prod-12",
    "sku": "HM-004",
    "name": "Juego de Llaves Mixtas 8-19mm",
    "brand": "Bahco",
    "model": "JM-819",
    "categoryId": "cat-1",
    "subcategoryId": "sub-2",
    "categoryName": "Herramientas Manuales",
    "subcategoryName": "Llaves",
    "stock": 40,
    "description": "Juego de 12 llaves mixtas de 8 a 19mm, cromadas, estuche plástico.",
    "image": ""
  },
  {
    "id": "prod-13",
    "sku": "ES-003",
    "name": "Lentes de Seguridad",
    "brand": "Pyramex",
    "model": "SB-1810",
    "categoryId": "cat-3",
    "subcategoryId": "sub-6",
    "categoryName": "Equipamiento de Seguridad",
    "subcategoryName": "EPP Personal",
    "stock": 250,
    "description": "Lentes de seguridad con protección UV, armazón de policarbonato.",
    "image": ""
  },
  {
    "id": "prod-14",
    "sku": "IL-002",
    "name": "Panel LED 60x60cm",
    "brand": "Philips",
    "model": "LED-6060",
    "categoryId": "cat-5",
    "subcategoryId": "sub-9",
    "categoryName": "Iluminación",
    "subcategoryName": "LED",
    "stock": 30,
    "description": "Panel LED 60x60cm, 40W, luz blanca 4000K, instalación empotrada.",
    "image": ""
  }
];
