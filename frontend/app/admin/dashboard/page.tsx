"use client";

import Link from "next/link";
import { ClipboardList, FolderTree, Package, Plus, ShoppingBag, Star } from "lucide-react";

import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Admin</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Dashboard</h1>
          </div>
          <Link href="/admin/products/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Product operations", "Create, edit, delete and publish catalog items.", Package, "/admin/products"],
            ["Stock control", "Update inventory and visibility in one workflow.", ShoppingBag, "/admin/products"],
            ["Featured catalog", "Control discounts, badges and featured products.", Star, "/admin/products"],
            ["Categories", "Add and organize product families used by the storefront.", FolderTree, "/admin/categories"],
            ["Orders", "View all orders, update status from placed to delivered.", ClipboardList, "/admin/orders"]
          ].map(([title, copy, Icon, href]) => (
            <Link key={title as string} href={href as string} className="premium-panel-strong rounded-[1.5rem] p-5">
              <Icon className="h-7 w-7 text-brand" />
              <h2 className="mt-5 text-xl font-semibold text-ink">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{copy as string}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
