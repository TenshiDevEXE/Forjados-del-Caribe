import { useCallback, useEffect, useState } from 'react';
import type { Notification, Product, QuoteItem } from '../lib/types';
import { QUOTE_STORAGE_KEY } from '../lib/constants';

function loadQuote(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveQuote(items: QuoteItem[]) {
  try {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useQuote() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(() => loadQuote());
  const [customerName, setCustomerName] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [phoneIndex, setPhoneIndex] = useState(0);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    saveQuote(quoteItems);
  }, [quoteItems]);

  const notify = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
  }, []);

  const addToQuote = useCallback(
    (product: Product) => {
      setQuoteItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      notify(`${product.name} agregado a la solicitud`, 'info');
    },
    [notify]
  );

  const changeQuantity = useCallback((productId: string, delta: number) => {
    setQuoteItems(prev =>
      prev
        .map(item =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromQuote = useCallback((productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const clearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0);

  return {
    quoteItems,
    setQuoteItems,
    customerName,
    setCustomerName,
    quoteNote,
    setQuoteNote,
    phoneIndex,
    setPhoneIndex,
    notification,
    setNotification,
    notify,
    addToQuote,
    changeQuantity,
    removeFromQuote,
    clearQuote,
    quoteCount,
  };
}
