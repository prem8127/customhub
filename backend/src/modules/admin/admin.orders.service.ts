import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { serializeOrder } from "../../utils/serializers.js";

const VALID_STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function listAdminOrders(query: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const where = query.search
    ? {
        OR: [
          { id: { contains: query.search, mode: "insensitive" as const } },
          { user: { email: { contains: query.search, mode: "insensitive" as const } } }
        ]
      }
    : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders: orders.map((o) => ({
      ...serializeOrder(o),
      user: o.user
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new HttpError(
      400,
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      "INVALID_STATUS"
    );
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new HttpError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
  });

  return { ...serializeOrder(updated), user: updated.user };
}
