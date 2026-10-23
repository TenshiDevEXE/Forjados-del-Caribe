# Ferrotech Industrial — Catálogo web

Catálogo de productos **100 % estático**, publicado en GitHub Pages. El visitante explora el catálogo, arma una lista y la envía por WhatsApp para pedir cotización.

> **Los precios no existen en el proyecto.** No hay campo de precio en el modelo de datos ni en el catálogo, así que es imposible que se filtren. El generador del build **falla** si alguien añade un campo que suene a precio.

## Características

- Catálogo con búsqueda, filtros por categoría/subcategoría y vista cuadrícula/lista
- Solicitud de cotización por WhatsApp (productos + cantidades, sin precios)
- Modo oscuro/claro (preferencia del visitante, guardada en `localStorage`)
- PWA instalable
- Sin backend, sin base de datos, sin mantenimiento: solo archivos estáticos

## Cómo editar el catálogo

Todo el contenido vive en **[content/catalog.json](content/catalog.json)**. Puedes editarlo directamente desde la web de GitHub (botón ✏️) y guardar el cambio: la web se reconstruye y publica sola.

```jsonc
{
  "config": {
    "name": "Forjados Del Caribe SRL",
    "slogan": "Suministros Ferreteros y Equipamiento Pesado",
    "logoType": "wrench",            // wrench | hammer | shield | cpu | hardhat | box
    "accentColor": "amber",          // amber | emerald | blue | violet | rose
    "footerText": "© 2026 Forjados Del Caribe SRL.",
    "contactPhone": "+18092272492",   // teléfono de la compañía (se muestra en el pie)
    "contactPhones": [               // números de WhatsApp para las solicitudes.
      { "label": "Ventas", "phone": "+18496263154" }   // el PRIMERO es el principal
    ],
    "contactEmail": "forjadosventas06@gmail.com",
    "address": "Calle San Juan de La Maguana #122, Cristo Rey, Santo Domingo. DN",
    "defaultTheme": "dark"           // dark | light
  },
  "categories": [
    { "id": "cat-1", "name": "Herramientas Manuales" }
  ],
  "subcategories": [
    { "id": "sub-1", "name": "Destornilladores", "categoryId": "cat-1" }
  ],
  "products": [
    {
      "id": "prod-1",
      "sku": "HM-001",
      "name": "Destornillador Phillips 6x100mm",
      "brand": "Stanley",
      "model": "PH-6-100",
      "categoryId": "cat-1",
      "subcategoryId": "sub-1",       // o null
      "stock": 150,                   // > 0 → "Disponible"; 0 → "A pedido"
      "description": "Punta magnética, mango ergonómico.",
      "image": ""                     // opcional: URL de la foto
    }
  ]
}
```

Reglas que valida el build (si algo falla, no se publica):

- `id` únicos en categorías, subcategorías y productos; `sku` único en productos
- `categoryId` de cada producto y de cada subcategoría debe existir
- `subcategoryId` debe existir y pertenecer a la categoría indicada
- `contactPhones` debe tener **al menos un número**; el primero es el principal
- **Ningún campo de precio** (`price`, `precio`, `sale_price`, `purchase_price`, `cost`…) ni campos desconocidos

### Varios números de WhatsApp

Las solicitudes pueden ir a más de un número. Añade entradas a `contactPhones`: la primera es la principal y la que aparece por defecto. Si hay más de una, el visitante ve un selector "Enviar a" en el panel de solicitud.

```jsonc
"contactPhones": [
  { "label": "Ventas",    "phone": "+18496263154" },   // principal
  { "label": "Almacén",   "phone": "+18095551234" },
  { "label": "Mostrador", "phone": "+18095559876" }
]
```

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5173
```

`npm run dev`, `npm run build` y `npm test` regeneran el catálogo automáticamente desde `content/catalog.json`.

| Comando | Qué hace |
| --- | --- |
| `npm run catalog` | Regenera `lib/catalog.generated.ts` y valida el catálogo |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida, comprueba tipos y compila en `dist/` |
| `npm run preview` | Sirve el contenido de `dist/` en local |
| `npm test` | Tests con Vitest |

## Arquitectura

```
content/catalog.json          ← fuente de verdad (lo único que editas)
scripts/build-catalog.mjs     ← valida y genera los datos del bundle
lib/catalog.generated.ts      ← datos generados (no editar a mano)
lib/api.ts                    ← punto único de acceso a los datos
lib/types.ts                  ← tipos del catálogo
lib/theme.ts                  ← colores de acento e iconos
App.tsx                       ← catálogo + solicitud de cotización
components/                   ← UI (modales, miniaturas, toggle de tema)
.github/workflows/deploy.yml  ← compila y publica en GitHub Pages en cada push a main
```

No hay backend, ni API REST, ni archivos JSON de base de datos: el catálogo se compila dentro del bundle.

## Publicación en GitHub Pages

1. Sube el proyecto a un repositorio **público**.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Haz push a `main`. El workflow compila, pasa los tests y publica.

La web quedará en `https://USUARIO.github.io/REPOSITORIO/`. Vite usa rutas relativas (`base: './'`), así que funciona igual en la raíz o en un subdirectorio; no hay que tocar la configuración si cambias el nombre del repositorio.

### Dominio propio (opcional)

Para usar un dominio como `forjadosdelcaribesrl.com`:

1. Añade un archivo `public/CNAME` con una sola línea: `forjadosdelcaribesrl.com`.
2. En tu proveedor de DNS, apunta el dominio a GitHub Pages (registros `A` a las IP de Pages o `CNAME` a `USUARIO.github.io`).
3. En **Settings → Pages → Custom domain** indica el dominio y activa *Enforce HTTPS*.

> DuckDNS no sirve para esto: GitHub Pages necesita registros `CNAME`/`TXT` que DuckDNS no permite.

## Privacidad de precios

- No existe ningún campo de precio en `content/catalog.json` ni en los tipos.
- `scripts/build-catalog.mjs` aborta el build si aparece un campo de precio, en cualquier nivel del JSON.
- La solicitud de WhatsApp incluye solo producto, SKU y cantidad.
- El bundle público (`dist/assets/*.js`) se puede inspeccionar: no contiene precios.

## Licencia

Proyecto privado de Ferrotech Industrial. Todos los derechos reservados.

Contacto: contacto@ferrotech.com · +54 11 4589-2200
