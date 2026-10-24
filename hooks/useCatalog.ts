import { useCallback, useEffect, useState } from 'react';
import { loadCatalog } from '../lib/api';
import type { Catalog, Theme } from '../lib/types';

const THEME_STORAGE_KEY = 'catalogo:theme';

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function useTheme(initialTheme?: Theme) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? initialTheme ?? 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const setThemePersisted = useCallback((next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  return { theme, setTheme: setThemePersisted, toggleTheme };
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadCatalog(controller.signal)
      .then(data => {
        setCatalog(data);
        setLoadError(null);
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setLoadError(error.message || 'Error al cargar el catálogo');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return { catalog, loadError, loading };
}
