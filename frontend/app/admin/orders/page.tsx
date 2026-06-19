"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { request } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

type OrderUser = { id: string; name: string; email: string; avatar: string };
type AdminOrder = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod: string;
  user: OrderUser;
  items: unknown[];
};

type PageData = {
  orders: AdminOrder[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

const STATUS_FLOW = ["placed", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUS_FLOW)[number];

const STATUS_COLORS: Record<Status, string> = {
  placed: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/");
  }, [user, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const result = await request<PageData>(`/admin/orders?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      const updated = await request<AdminOrder>(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
            }
          : prev
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Order Management</h1>
          {data && (
            <p className="mt-1 text-sm text-steel">
              {data.total} total order{data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="premium-input flex items-center gap-2 rounded-2xl px-4 py-2.5">
            <Search className="h-4 w-4 text-steel" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48 bg-transparent text-sm outline-none placeholder:text-steel"
              placeholder="Order ID or email…"
            />
          </form>
          <button
            onClick={fetchOrders}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-brand hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="premium-panel-strong overflow-hidden rounded-[1.5rem]">
        {loading && !data ? (
          <div className="flex h-48 items-center justify-center text-sm text-steel">
            Loading orders…
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-steel">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-steel">
                  <th className="px-4 py-4">Order ID</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Items</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/40">
                    <td className="px-4 py-4 font-mono font-semibold text-brand">{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-ink">{order.user.name}</div>
                      <div className="text-xs text-steel">{order.user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-steel">
                      {Array.isArray(order.items) ? order.items.length : "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-4 py-4 text-steel">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[order.status as Status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="premium-input rounded-xl px-3 py-2 text-xs font-semibold text-brand outline-none disabled:opacity-50"
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-brand disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-ink">
            Page {data.page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-brand disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
