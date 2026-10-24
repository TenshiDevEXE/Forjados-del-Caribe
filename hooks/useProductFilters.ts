import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildGroups } from '../lib/category-groups';
import type { CategoryGroup } from '../lib/category-groups';
import type { Product } from '../lib/types';
import { PAGE_SIZE } from '../lib/constants';
import { readFiltersFromUrl, writeFiltersToUrl } from '../lib/url';

export type SortOption = 'default' | 'alphabetical' | 'byStock';

export function useProductFilters(products: Product[], categories: string[]) {
  const initial = readFiltersFromUrl();
  const [searchTerm, setSearchTerm] = useState(initial.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search || '');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(initial.group);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initial.category);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const groups = useMemo(() => buildGroups(categories), [categories]);

  const productsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const activeGroup = useMemo(
    () => groups.find(group => group.name === selectedGroup) ?? null,
    [groups, selectedGroup]
  );

  const groupCategories = useMemo(() => new Set(activeGroup?.categories ?? []), [activeGroup]);

  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    let result = products.filter(product => {
      if (selectedCategory) {
        if (product.category !== selectedCategory) return false;
      } else if (activeGroup && !groupCategories.has(product.category)) {
        return false;
      }
      if (availableOnly && product.stock <= 0) return false;
      if (!term) return true;
      return [product.name, product.id, product.model ?? ''].some(field =>
        field.toLowerCase().includes(term)
      );
    });

    switch (sortBy) {
      case 'alphabetical':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'byStock':
        result = [...result].sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, activeGroup, groupCategories, availableOnly, sortBy]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, selectedGroup, selectedCategory, availableOnly, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasFilters = Boolean(
    debouncedSearch.trim() || selectedGroup || selectedCategory || availableOnly
  );

  useEffect(() => {
    writeFiltersToUrl({
      search: searchTerm,
      group: selectedGroup,
      category: selectedCategory,
      view: 'list',
    });
  }, [searchTerm, selectedGroup, selectedCategory]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGroup(null);
    setSelectedCategory(null);
    setAvailableOnly(false);
    setSortBy('default');
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(count => count + PAGE_SIZE);
  }, []);

  const canLoadMore = visibleProducts.length < filteredProducts.length;

  const remainingCount = filteredProducts.length - visibleProducts.length;

  return {
    searchTerm,
    setSearchTerm,
    selectedGroup,
    setSelectedGroup,
    selectedCategory,
    setSelectedCategory,
    availableOnly,
    setAvailableOnly,
    sortBy,
    setSortBy,
    visibleProducts,
    filteredProducts,
    groups,
    productsByCategory,
    activeGroup,
    hasFilters,
    clearFilters,
    loadMore,
    canLoadMore,
    remainingCount,
    visibleCount,
  };
}
