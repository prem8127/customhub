import { Address, CartItem, Order, Product, ProductCategory, ProductInput, UserProfile, categories as categoryNames } from "@/lib/types";

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export function getApiUrl() {
  if (typeof window === "undefined") {
    // Server-side: always use the env var directly — never try to rewrite host
    return DEFAULT_API_URL;
  }
  // Client-side: if the app was opened via a network IP, rewrite to that IP
  // so API calls still work on the same machine without CORS issues.
  // Google OAuth redirect still uses localhost (set in NEXT_PUBLIC_GOOGLE_REDIRECT_URI).
  const configuredUrl = new URL(DEFAULT_API_URL);
  const configuredHost = configuredUrl.hostname;
  const browserHost = window.location.hostname;

  if (
    browserHost &&
    !["127.0.0.1", "localhost"].includes(browserHost) &&
    ["127.0.0.1", "localhost"].includes(configuredHost)
  ) {
    configuredUrl.hostname = browserHost;
  }

  return configuredUrl.toString().replace(/\/$/, "");
}

export function assetUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads/")) {
    return getApiUrl().replace(/\/api$/, "") + url;
  }
  return url;
}

type ProductQuery = {
  category?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type AuthResponse = {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: UserProfile;
};

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {}
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  try {
    return await request<Product[]>(`/products?${params.toString()}`);
  } catch {
    // Backend unreachable — return empty list so pages render
    return [];
  }
}

export async function fetchProduct(id: string): Promise<Product> {
  // No fallback — missing product should 404
  return await request<Product>(`/products/${id}`);
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  try {
    return await request<ProductCategory[]>("/categories");
  } catch {
    // Fallback to static list so the page still renders when backend is down
    return categoryNames.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: "Custom-ready products with polished materials and finish options."
    }));
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAdminProducts(token: string) {
  return await request<Product[]>("/admin/products", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchAdminProduct(id: string, token: string) {
  return await request<Product>(`/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createAdminProduct(payload: ProductInput, token: string) {
  return await request<Product>("/admin/products", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function updateAdminProduct(id: string, payload: Partial<ProductInput>, token: string) {
  return await request<Product>(`/admin/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminProduct(id: string, token: string) {
  return await request<{ deleted: boolean }>(`/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createAdminCategory(
  payload: { name: string; slug?: string; description?: string },
  token: string
) {
  return await request<ProductCategory>("/admin/categories", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function registerUser(payload: { name: string; email: string; password: string }) {
  return await request<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return await request<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function googleLogin(payload: { code: string }) {
  return await request<AuthResponse>("/google-auth", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function refreshSession(refreshToken?: string) {
  return await request<AuthResponse>("/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}

export async function logoutUser(refreshToken?: string) {
  try {
    await request<void>("/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    });
  } catch {
    // Local logout still completes even if API is offline
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function fetchOrders(token?: string) {
  return await request<Order[]>("/orders", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export async function createCommerceOrder(payload: {
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  token?: string;
}) {
  return await request<Order>("/order", {
    method: "POST",
    headers: payload.token ? { Authorization: `Bearer ${payload.token}` } : {},
    body: JSON.stringify(payload)
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function createPaymentOrder(payload: {
  amount: number;
  currency: string;
  notes?: Record<string, string>;
}) {
  return await request<{
    id: string;
    amount: number;
    currency: string;
    gateway: string;
    key?: string;
  }>("/create-order", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyPayment(payload: {
  paymentId: string;
  orderId: string;
  signature: string;
}) {
  return await request<{ verified: boolean }>("/verify-payment", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// ── Customization ─────────────────────────────────────────────────────────────

export async function uploadDesign(payload: {
  productId: string;
  previewDataUrl: string;
  message?: string;
}) {
  try {
    return await request<{ url: string }>("/upload-design", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch {
    return { url: payload.previewDataUrl };
  }
}

export async function previewDesign(payload: {
  productId: string;
  text?: string;
  asset?: string;
}) {
  try {
    return await request<{ preview: string }>("/preview", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch {
    return { preview: payload.asset ?? "" };
  }
}
