import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildGroups } from '../lib/category-groups';
import type { CategoryGroup } from '../lib/category-groups';
import type { Product } from '../lib/types';

const PAGE_SIZE = 60;

export function useProductFilters(products: Product[], categories: string[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
    const term = searchTerm.trim().toLowerCase();
    return products.filter(product => {
      if (selectedCategory) {
        if (product.category !== selectedCategory) return false;
      } else if (activeGroup && !groupCategories.has(product.category)) {
        return false;
      }
      if (!term) return true;
      return [product.name, product.id, product.model ?? ''].some(field =>
        field.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm, selectedCategory, activeGroup, groupCategories]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedGroup, selectedCategory]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasFilters = Boolean(searchTerm.trim() || selectedGroup || selectedCategory);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGroup(null);
    setSelectedCategory(null);
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
