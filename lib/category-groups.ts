// Agrupación de categorías para la navegación (solo interfaz).
//
// El inventario trae 34 categorías; mostrarlas todas juntas satura la pantalla.
// Aquí se agrupan en familias para que el visitante filtre primero por grupo y
// después por categoría. No cambia los datos: public/catalog.json sigue igual.
//
// Si el inventario incorpora una categoría que no esté en esta lista, aparecerá
// automáticamente en "Otras categorías", así que nada se queda fuera.

export interface CategoryGroup {
  name: string;
  categories: string[];
}

export const OTHER_GROUP_NAME = 'Otras categorías';

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: 'Aceros y Metales',
    categories: [
      'ACERO ESTRUCTURAL',
      'ACERO INOXIDABLE',
      'ACEROS ESPECIALES',
      'MATERIALES DE ALUMINIO',
      'MATERIAL DE HERRERIA',
    ],
  },
  {
    name: 'Herramientas y Soldadura',
    categories: [
      'HERRAMIENTAS DE MANO',
      'HERRAMIENTAS ELECTRICAS',
      'MAQUINARIA',
      'ABRASIVOS',
      'SOLDADURA',
      'ELECTRODOS',
    ],
  },
  {
    name: 'Tornillería y Herrajes',
    categories: ['TORNILLERIA Y AFINES', 'ACCESORIOS', 'HERRAJES', 'TRANSMISION'],
  },
  {
    name: 'Adornos y Decoración',
    categories: [
      'ADORNOS ALUMINIO',
      'ADORNOS BRONCE',
      'ADORNOS ESTAMPADOS',
      'ADORNOS FORJADOS',
      'ADORNOS FUNDICION',
      'CLAVOS DECORATIVO',
    ],
  },
  {
    name: 'Construcción y Afines',
    categories: [
      'MATERIALES DE CONSTRUCCION',
      'MADERAS Y AFINES',
      'PUERTAS ENRROLLABLES Y AFINES',
      'TECHOS Y AFINES',
      'PLOMERIA Y AFINES',
    ],
  },
  {
    name: 'Electricidad y Mantenimiento',
    categories: [
      'ELECTRICIDAD Y AFINES',
      'VENTILACION',
      'FILTROS Y LUBRICANTES',
      'SUMINISTRO REPUESTOS VEHICULO',
    ],
  },
  {
    name: 'Pinturas y Papelería',
    categories: ['PINTURAS Y AFINES', 'PAPELERIA Y AFINES'],
  },
  {
    name: 'Seguridad',
    categories: ['SEGURIDAD PERIMETRAL', 'SEGURIDAD PERSONAL'],
  },
];

function normalize(category: string): string {
  return category.trim().toUpperCase();
}

/**
 * Combina el mapa anterior con las categorías reales del catálogo:
 * - descarta las categorías que ya no existen en el inventario,
 * - descarta los grupos que se quedarían vacíos,
 * - envuelve en "Otras categorías" las que no estén en ningún grupo.
 */
export function buildGroups(categories: string[]): CategoryGroup[] {
  const available = new Map<string, string>();
  for (const category of categories) available.set(normalize(category), category);

  const assigned = new Set<string>();
  const groups: CategoryGroup[] = [];

  for (const group of CATEGORY_GROUPS) {
    const present: string[] = [];
    for (const name of group.categories) {
      const key = normalize(name);
      const real = available.get(key);
      if (real) {
        present.push(real);
        assigned.add(key);
      }
    }
    if (present.length > 0) groups.push({ name: group.name, categories: present });
  }

  const leftovers = categories.filter(category => !assigned.has(normalize(category)));
  if (leftovers.length > 0) groups.push({ name: OTHER_GROUP_NAME, categories: leftovers });

  return groups;
}
