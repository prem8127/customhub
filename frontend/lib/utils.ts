import { CartItem, Order, Product } from "@/lib/types";

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function orderFromCart(
  items: CartItem[],
  shippingAddress: Order["shippingAddress"],
  paymentMethod: string
): Order {
  return {
    id: `CH-${Math.floor(Math.random() * 90000000 + 10000000)}`,
    createdAt: new Date().toISOString(),
    total: cartTotal(items),
    status: "placed",
    items,
    shippingAddress,
    paymentMethod
  };
}

export function findProduct(productId: string, products: Product[]) {
  return products.find((item) => item.id === productId || item.slug === productId);
}
