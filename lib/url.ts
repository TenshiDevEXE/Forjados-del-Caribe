export function readFiltersFromUrl() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const search = params.get('q') ?? '';
  const group = params.get('g');
  const category = params.get('c');
  const view = params.get('v');
  return {
    search,
    group: group || null,
    category: category || null,
    view: view === 'grid' || view === 'list' ? (view as 'grid' | 'list') : null,
  };
}

export function writeFiltersToUrl(filters: {
  search: string;
  group: string | null;
  category: string | null;
  view: string;
}) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (filters.search.trim()) params.set('q', filters.search.trim());
  else params.delete('q');
  if (filters.group) params.set('g', filters.group);
  else params.delete('g');
  if (filters.category) params.set('c', filters.category);
  else params.delete('c');
  if (filters.view) params.set('v', filters.view);
  else params.delete('v');
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
  window.history.replaceState({}, '', newUrl);
}
