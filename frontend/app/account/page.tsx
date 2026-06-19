"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, ShoppingBag, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export default function AccountPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 pb-28 text-center sm:px-6">
        <div className="premium-panel-strong rounded-[2rem] p-8">
          <UserRound className="mx-auto h-10 w-10 text-brand" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink">Customer account</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
            Login to view saved addresses, orders, and checkout details.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
              Customer login
            </Link>
            <Link href="/products" className="rounded-full border border-line bg-white/70 px-6 py-3 text-sm font-semibold text-brand">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
      <section className="premium-panel-dark rounded-[2rem] p-7 text-white">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-xl font-bold text-brand">
              {user.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-white/65">Customer profile</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight">{user.name}</h1>
              <p className="mt-1 text-sm text-white/70">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          { href: "/products", title: "Products", copy: "Browse visible products and customize items.", icon: ShoppingBag },
          { href: "/orders", title: "Orders", copy: "Review order history and delivery progress.", icon: Package },
          { href: "/cart", title: "Cart", copy: "Continue checkout with saved account details.", icon: ShoppingBag }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="premium-panel-strong rounded-[1.5rem] p-5">
              <Icon className="h-7 w-7 text-brand" />
              <h2 className="mt-5 text-xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{item.copy}</p>
            </Link>
          );
        })}
      </section>

      <section className="premium-panel-strong mt-6 rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Saved addresses</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Delivery details</h2>
          </div>
          <MapPin className="h-6 w-6 text-brand" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {user.addresses.length > 0 ? (
            user.addresses.map((address) => (
              <div key={address.id} className="rounded-[1.25rem] border border-line bg-white/65 p-4">
                <p className="font-semibold text-ink">{address.fullName}</p>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {address.line1}, {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand">{address.phone}</p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.25rem] border border-line bg-white/65 p-4 text-sm text-steel">
              No saved addresses yet. You can add delivery details during checkout.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
