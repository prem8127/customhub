"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { OrderTimeline } from "@/components/order-timeline";
import { fetchOrders } from "@/lib/api";
import { Order } from "@/lib/types";
import { currency } from "@/lib/utils";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      return;
    }

    let cancelled = false;

    void fetchOrders(token)
      .then((nextOrders) => {
        if (!cancelled) {
          setOrders(nextOrders);
        }
      })
      .catch((error) => {
        if (!cancelled && error instanceof Error && /401|Unauthorized/i.test(error.message)) {
          setOrders([]);
          return;
        }

        if (!cancelled) {
          console.error("Failed to load orders", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.34em] text-steel">Orders</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Track every order</h1>
        </div>
        <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-sm text-steel">
          Please sign in to view your order history.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.34em] text-steel">Orders</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Track every order</h1>
      </div>
      <div className="mt-10 space-y-5">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-steel">{order.id}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{currency.format(order.total)}</h2>
                <p className="mt-2 text-sm text-steel">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}{" "}
                  via {order.paymentMethod}
                </p>
              </div>
              <div className="min-w-[280px]">
                <OrderTimeline status={order.status} />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm text-steel">{item.product.category}</p>
                    <p className="mt-1 font-medium text-ink">{item.product.name}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
