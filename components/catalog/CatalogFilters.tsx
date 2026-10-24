import { Search, Grid, List, X } from 'lucide-react';
import { formatCount } from '../../utils/format';
import type { AccentStyles } from '../../lib/types';
import type { CategoryGroup } from '../../lib/category-groups';

interface CatalogFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  groups: CategoryGroup[];
  selectedGroup: string | null;
  onGroupChange: (group: string | null) => void;
  activeGroup: CategoryGroup | null;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  productsByCategory: Map<string, number>;
  totalProducts: number;
  hasFilters: boolean;
  onClearFilters: () => void;
  accent: AccentStyles;
}

export default function CatalogFilters({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  groups,
  selectedGroup,
  onGroupChange,
  activeGroup,
  selectedCategory,
  onCategoryChange,
  productsByCategory,
  totalProducts,
  hasFilters,
  onClearFilters,
  accent,
}: CatalogFiltersProps) {
  const groupChip = (active: boolean) =>
    `chip px-3 py-1.5 text-sm ${
      active
        ? 'border-navy-800 bg-navy-800 text-white'
        : 'border-line bg-elevated text-muted hover:border-navy-400 hover:text-ink'
    }`;

  const categoryChip = (active: boolean) =>
    `chip px-2.5 py-1 text-xs ${
      active
        ? `${accent.border} ${accent.softBg} ${accent.text}`
        : 'border-line bg-elevated text-muted hover:border-navy-400 hover:text-ink'
    }`;

  const viewButton = (active: boolean) =>
    `inline-flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 ease-tahoe active:scale-[0.98] ${
      active ? 'bg-navy-800 text-white' : 'text-muted hover:text-ink'
    }`;

  return (
    <div className="panel space-y-4 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por descripción, código o modelo…"
            aria-label="Buscar en el catálogo"
            className="field pl-9"
          />
        </div>
        <div className="inline-flex shrink-0 self-start rounded-lg border border-line p-0.5">
          <button
            onClick={() => onViewModeChange('list')}
            className={viewButton(viewMode === 'list')}
            aria-label="Vista de lista"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={viewButton(viewMode === 'grid')}
            aria-label="Vista en cuadrícula"
            aria-pressed={viewMode === 'grid'}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Familias
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              onGroupChange(null);
              onCategoryChange(null);
            }}
            className={groupChip(!selectedGroup)}
          >
            Todas
            <span className={!selectedGroup ? 'text-white/70' : 'text-muted'}>
              {formatCount(totalProducts)}
            </span>
          </button>
          {groups.map(group => (
            <button
              key={group.name}
              onClick={() => {
                onGroupChange(group.name);
                onCategoryChange(null);
              }}
              className={groupChip(selectedGroup === group.name)}
            >
              {group.name}
              <span className={selectedGroup === group.name ? 'text-white/70' : 'text-muted'}>
                {formatCount(
                  group.categories.reduce(
                    (total, category) => total + (productsByCategory.get(category) ?? 0),
                    0
                  )
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeGroup && (
        <div className="border-t border-line pt-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {activeGroup.name}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onCategoryChange(null)} className={categoryChip(!selectedCategory)}>
              Todas las líneas
            </button>
            {activeGroup.categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={categoryChip(selectedCategory === category)}
              >
                {category}
                <span className="text-muted">{productsByCategory.get(category) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <div className="flex justify-end border-t border-line pt-3">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:underline dark:text-navy-300"
          >
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
