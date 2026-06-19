"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { CartItem, CustomizationState, Product } from "@/lib/types";
import { cartCount, cartTotal } from "@/lib/utils";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, customization?: CustomizationState) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "customhub_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (product, customization) => {
        setItems((current) => {
          const existing = current.find(
            (item) =>
              item.product.id === product.id &&
              JSON.stringify(item.customization ?? {}) === JSON.stringify(customization ?? {})
          );

          if (existing) {
            return current.map((item) =>
              item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }

          return [
            ...current,
            {
              id: `${product.id}-${Date.now()}`,
              product,
              quantity: 1,
              customization
            }
          ];
        });
      },
      updateQuantity: (itemId, quantity) => {
        setItems((current) =>
          current
            .map((item) => (item.id === itemId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem: (itemId) => {
        setItems((current) => current.filter((item) => item.id !== itemId));
      },
      clearCart: () => setItems([]),
      itemCount: cartCount(items),
      subtotal: cartTotal(items)
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
