import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductId } from "../backend";

/**
 * Resolve a product image to a renderable URL, tolerating a missing or empty
 * blob. An empty blob hash throws "Hash must not be empty" when serialized, so
 * callers must never invoke getDirectURL() on one. Returns null when there is
 * no usable image, letting the caller render a placeholder.
 */
export function safeImageUrl(
  image: { getDirectURL(): string } | null | undefined,
): string | null {
  if (!image) return null;
  try {
    const url = image.getDirectURL();
    return url && url.trim().length > 0 ? url : null;
  } catch {
    return null;
  }
}

export interface CartItem {
  productId: ProductId;
  slug: string;
  name: string;
  weight: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: ProductId, weight: string) => void;
  updateQuantity: (
    productId: ProductId,
    weight: string,
    quantity: number,
  ) => void;
  clear: () => void;
}

const sameLine = (
  item: CartItem,
  productId: ProductId,
  weight: string,
): boolean => item.productId === productId && item.weight === weight;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((line) =>
            sameLine(line, item.productId, item.weight),
          );
          if (existing) {
            return {
              items: state.items.map((line) =>
                sameLine(line, item.productId, item.weight)
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (productId, weight) =>
        set((state) => ({
          items: state.items.filter(
            (line) => !sameLine(line, productId, weight),
          ),
        })),
      updateQuantity: (productId, weight, quantity) =>
        set((state) => ({
          items: state.items
            .map((line) =>
              sameLine(line, productId, weight)
                ? { ...line, quantity: Math.max(1, quantity) }
                : line,
            )
            .filter((line) => line.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "cakencoffe-cart" },
  ),
);

/* ---------------------------------------------------------------------------
   Derived selectors — plain functions over the store snapshot
--------------------------------------------------------------------------- */

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

export function lineSubtotal(line: CartItem): number {
  return line.unitPrice * line.quantity;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + lineSubtotal(line), 0);
}

export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
