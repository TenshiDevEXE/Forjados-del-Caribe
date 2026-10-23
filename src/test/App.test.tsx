import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';
import { CATALOG_CONFIG, CATALOG_PRODUCTS } from '../../lib/catalog.generated';

describe('App', () => {
  it('muestra el comercio y los productos del catálogo', () => {
    render(<App />);
    expect(screen.getByText(CATALOG_CONFIG.name)).toBeInTheDocument();
    expect(screen.getByText(CATALOG_PRODUCTS[0].name)).toBeInTheDocument();
  });

  it('no incluye ningún precio en los datos del catálogo', () => {
    const priceLike = /price|precio|cost/i;
    for (const product of CATALOG_PRODUCTS) {
      expect(Object.keys(product).filter(key => priceLike.test(key))).toEqual([]);
    }
  });
});
