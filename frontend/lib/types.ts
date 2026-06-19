export const categories = [
  "T-shirts",
  "Hoodies",
  "Mobile covers",
  "Bike accessories",
  "Stickers",
  "Keychains",
  "Chargers & safety accessories"
] as const;

export type Category = (typeof categories)[number];

export type Product = {
  id: string;
  slug: string;
  title?: string;
  name: string;
  category: Category | string;
  brand?: string;
  price: number;
  discountPrice?: number | null;
  originalPrice?: number;
  stock?: number;
  images?: string[];
  thumbnail?: string | null;
  tags?: string[];
  visibilityStatus?: "visible" | "hidden" | "draft";
  featured?: boolean;
  popularity: number;
  rating: number;
  badge: string;
  summary: string;
  description: string;
  turnaround: string;
  features: string[];
  materials: string[];
  accent: string;
  surface: string;
  customizable: boolean;
  art: {
    base: string;
    glow: string;
    detail: string;
  };
};

export type ProductInput = {
  title: string;
  slug: string;
  description: string;
  summary?: string;
  price: number;
  discountPrice?: number | null;
  originalPrice?: number | null;
  category: string;
  brand?: string;
  stock: number;
  images?: string[];
  thumbnail?: string | null;
  uploadedImages?: Array<{ name?: string; dataUrl: string }>;
  tags?: string[];
  visibilityStatus: "visible" | "hidden" | "draft";
  featured: boolean;
  rating?: number;
  popularity?: number;
  badge?: string;
  turnaround?: string;
  features?: string[];
  materials?: string[];
  accent?: string;
  surface?: string;
  customizable?: boolean;
  art?: Record<string, unknown>;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type CategoryHighlight = {
  label: Category;
  description: string;
  tone: string;
  accent: string;
};

export type CustomizationState = {
  message?: string;
  textColor?: string;
  textFont?: string;
  uploadedAsset?: string;
  previewDataUrl?: string;
  // Fabric.js canvas state
  fabricJson?: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  customization?: CustomizationState;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: "user" | "admin";
  addresses: Address[];
};

export type OrderStatus = "placed" | "confirmed" | "production" | "shipped" | "delivered";

export type Order = {
  id: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
};
