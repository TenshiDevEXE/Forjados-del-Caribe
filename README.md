# Forjados Del Caribe SRL — Catálogo web

Catálogo de productos **100 % estático**, publicado en GitHub Pages. El visitante explora el catálogo, arma una lista y la envía por WhatsApp para pedir cotización.

> **Los precios no existen en el proyecto.** No hay campo de precio en el modelo de datos ni en el catálogo, así que es imposible que se filtren. Tanto el importador como el validador del build **abortan** si aparece un campo que suene a precio.

## Características

- Catálogo con búsqueda (nombre, código o modelo), filtro por categoría y vista cuadrícula/lista
- Navegación en dos niveles: **grupos de categorías** y, dentro de cada grupo, sus categorías
- Miles de productos con carga por tandas (60 por tanda) para que el navegador no se bloquee
- Solicitud de cotización por WhatsApp (productos + cantidades, sin precios)
- Estilo corporativo: paleta azul marino + dorado apagado, tipografía Inter y acento configurable (`gold` | `navy` | `emerald`)
- Modo oscuro/claro (**claro por defecto**, con conmutador; la preferencia del visitante se guarda en `localStorage`)
- PWA instalable (el catálogo se guarda en caché y funciona sin conexión)
- Sin backend, sin base de datos, sin mantenimiento: solo archivos estáticos

## Cómo actualizar el inventario

El catálogo se genera a partir del inventario exportado del sistema (XLS, XLSX o CSV con las columnas `Código`, `Descripción`, `Categoría`, `Ref. Proveedor` y `Existencia`).

```bash
npm run import -- "E:\data\Archivo.XLS"
```

El importador:

- **descarta por diseño** todas las columnas de precio;
- conserva la `config` (nombre, teléfonos, tema) del catálogo actual;
- deduplica códigos y descarta filas vacías;
- escribe **`public/catalog.json`**, que es lo que se publica.

Al terminar muestra un resumen (`Productos importados`, `En existencia`, `Categorías`, `Precios importados: 0`). Después, subir el cambio a `main` publica la web actualizada.

### Formato de `public/catalog.json`

```jsonc
{
  "config": {
    "name": "Forjados Del Caribe SRL",
    "slogan": "Suministros Ferreteros y Equipamiento Pesado",
    "logoType": "wrench",            // wrench | hammer | shield | cpu | hardhat | box
    "accentColor": "gold",           // gold | navy | emerald
    "footerText": "© 2026 Forjados Del Caribe SRL.",
    "contactPhone": "+18092272492",   // teléfono de la compañía (se muestra en el pie)
    "contactPhones": [               // números de WhatsApp para las solicitudes.
      { "label": "Ventas", "phone": "+18496263154" }   // el PRIMERO es el principal
    ],
    "contactEmail": "forjadosventas06@gmail.com",
    "address": "Calle San Juan de La Maguana #122, Cristo Rey, Santo Domingo. DN",
    "theme": "light"                 // dark | light (tema inicial)
  },
  "categories": ["HERRAMIENTAS DE MANO", "SOLDADURA"],
  "products": [
    {
      "id": "12345",                 // código del inventario (único)
      "name": "Disco de corte 7\" x 1/8\"",
      "category": "ABRASIVOS",       // debe existir en "categories"
      "model": "DW-7018",            // opcional
      "stock": 150                   // > 0 → "Disponible"; 0 → "A pedido"
    }
  ]
}
```

El archivo `content/catalog.json` contiene solo la `config` inicial (semilla de nombre, teléfonos y tema) que usa el importador la primera vez.

Reglas que valida el build (si algo falla, no se publica):

- `id` únicos en productos y nombres de categoría únicos
- la `category` de cada producto debe estar declarada en `categories`
- `contactPhones` debe tener **al menos un número**; el primero es el principal
- **Ningún campo de precio** (`price`, `precio`, `sale_price`, `purchase_price`, `cost`…) ni campos desconocidos

### Grupos de categorías (navegación)

Con 34 categorías, mostrarlas todas juntas satura la pantalla. `lib/category-groups.ts` las agrupa en familias y la web filtra primero por grupo y después por categoría:

| Grupo | Categorías |
| --- | --- |
| Aceros y Metales | ACERO ESTRUCTURAL, ACERO INOXIDABLE, ACEROS ESPECIALES, MATERIALES DE ALUMINIO, MATERIAL DE HERRERIA |
| Herramientas y Soldadura | HERRAMIENTAS DE MANO, HERRAMIENTAS ELECTRICAS, MAQUINARIA, ABRASIVOS, SOLDADURA, ELECTRODOS |
| Tornillería y Herrajes | TORNILLERIA Y AFINES, ACCESORIOS, HERRAJES, TRANSMISION |
| Adornos y Decoración | ADORNOS ALUMINIO, ADORNOS BRONCE, ADORNOS ESTAMPADOS, ADORNOS FORJADOS, ADORNOS FUNDICION, CLAVOS DECORATIVO |
| Construcción y Afines | MATERIALES DE CONSTRUCCION, MADERAS Y AFINES, PUERTAS ENRROLLABLES Y AFINES, TECHOS Y AFINES, PLOMERIA Y AFINES |
| Electricidad y Mantenimiento | ELECTRICIDAD Y AFINES, VENTILACION, FILTROS Y LUBRICANTES, SUMINISTRO REPUESTOS VEHICULO |
| Pinturas y Papelería | PINTURAS Y AFINES, PAPELERIA Y AFINES |
| Seguridad | SEGURIDAD PERIMETRAL, SEGURIDAD PERSONAL |

Es solo interfaz: no cambia `public/catalog.json`. Para reorganizarlos, edita ese archivo y mueve cada categoría de lista. Si el inventario estrena una categoría que no esté en ningún grupo, aparece sola en **"Otras categorías"** (y el test del proyecto avisa), así que nunca se queda fuera de la web.

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

| Comando | Qué hace |
| --- | --- |
| `npm run import -- <archivo>` | Regenera `public/catalog.json` desde el inventario (XLS/XLSX/CSV) |
| `npm run catalog` | Valida `public/catalog.json` (estructura y ausencia de precios) |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida, comprueba tipos y compila en `dist/` |
| `npm run preview` | Sirve el contenido de `dist/` en local |
| `npm test` | Tests con Vitest |

## Arquitectura

```
E:\data\Archivo.XLS          ← inventario del sistema (con precios; nunca al repositorio)
scripts/import-inventory.mjs ← lo convierte en catálogo y descarta los precios
public/catalog.json          ← catálogo publicado (miles de productos)
scripts/build-catalog.mjs    ← valida el catálogo; aborta el build si hay precios
lib/api.ts                   ← carga el catálogo con fetch en tiempo de ejecución
lib/types.ts                 ← tipos del catálogo
lib/category-groups.ts       ← grupos de categorías para la navegación
lib/theme.ts                 ← colores de acento e iconos
App.tsx                      ← catálogo + solicitud de cotización
components/                  ← UI (modales, conmutador de tema)
.github/workflows/deploy.yml ← compila y publica en GitHub Pages en cada push a main
```

No hay backend ni base de datos persistente: el catálogo es un único archivo JSON que la web descarga al abrirse.

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

> **Importante:** el repositorio es público, así que `public/catalog.json` también lo es. Nunca debe contener precios: por eso el importador los descarta antes de escribir.

## Privacidad de precios

- No existe ningún campo de precio en los tipos ni en `public/catalog.json`.
- `scripts/import-inventory.mjs` solo lee las columnas permitidas y valida antes de escribir.
- `scripts/build-catalog.mjs` aborta el build si aparece un campo de precio, a cualquier nivel del JSON.
- La solicitud de WhatsApp incluye solo nombre, código y cantidad.

## Licencia

Proyecto privado de Forjados Del Caribe SRL. Todos los derechos reservados.

Contacto: forjadosventas06@gmail.com · +18092272492
