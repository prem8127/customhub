import { Order, Product, User } from "@prisma/client";

export function serializeUser(user: Pick<User, "id" | "name" | "email" | "avatar" | "addresses" | "role">) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    addresses: user.addresses ?? []
  };
}

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title ?? product.name,
    name: product.name,
    category: product.category,
    brand: product.brand ?? "",
    price: product.price,
    discountPrice: product.discountPrice,
    originalPrice: product.originalPrice,
    stock: product.stock,
    images: product.images,
    thumbnail: product.thumbnail,
    tags: product.tags,
    visibilityStatus: product.visibilityStatus,
    featured: product.featured,
    popularity: product.popularity,
    rating: product.rating,
    badge: product.badge,
    summary: product.summary,
    description: product.description,
    turnaround: product.turnaround,
    features: product.features,
    materials: product.materials,
    accent: product.accent,
    surface: product.surface,
    customizable: product.customizable,
    art: product.art
  };
}

export function serializeOrder(order: Order) {
  return {
    id: order.id,
    createdAt: `${order.createdAt.toISOString().replace(/Z$/, "")}Z`,
    total: order.total,
    status: order.status,
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod
  };
}
