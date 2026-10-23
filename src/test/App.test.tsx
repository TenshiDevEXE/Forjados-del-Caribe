import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import App from '../../App';
import { buildGroups, OTHER_GROUP_NAME } from '../../lib/category-groups';
import type { Catalog } from '../../lib/types';

// El catálogo real que se publica (miles de productos).
const catalog = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public', 'catalog.json'), 'utf8')
) as Catalog;

describe('public/catalog.json', () => {
  it('no contiene ningún campo con aspecto de precio', () => {
    const priceLike = /price|precio|cost|coste|costo|sale|importe|tarifa/i;
    const offenders = catalog.products.flatMap(product =>
      Object.keys(product).filter(key => priceLike.test(key))
    );
    expect(offenders).toEqual([]);
  });

  it('solo referencia categorías declaradas', () => {
    const categories = new Set(catalog.categories);
    const unknown = catalog.products
      .filter(product => !categories.has(product.category))
      .map(product => product.category);
    expect([...new Set(unknown)]).toEqual([]);
  });
});

describe('agrupación de categorías', () => {
  it('cubre cada categoría del catálogo una sola vez', () => {
    const groups = buildGroups(catalog.categories);
    const grouped = groups.flatMap(group => group.categories);

    expect(groups.map(group => group.name)).not.toContain(OTHER_GROUP_NAME);
    expect(grouped).toHaveLength(catalog.categories.length);
    expect(new Set(grouped).size).toBe(catalog.categories.length);
  });
});

describe('App', () => {
  const sample: Catalog = {
    config: catalog.config,
    categories: catalog.categories,
    products: catalog.products.slice(0, 5),
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => sample }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el comercio y los productos del catálogo', async () => {
    render(<App />);
    expect((await screen.findAllByText(sample.config.name)).length).toBeGreaterThan(0);
    expect(screen.getByText(sample.products[0].name)).toBeInTheDocument();
  });
});
