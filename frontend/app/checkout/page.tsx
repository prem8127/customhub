"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { createCommerceOrder, createPaymentOrder, verifyPayment } from "@/lib/api";
import { Address } from "@/lib/types";
import { currency } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// Removed "Stripe Cards" — not integrated
const paymentModes = ["Razorpay UPI", "Google Pay", "PhonePe", "Paytm"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCart();
  const { token, saveAddress, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const defaultAddress = useMemo(
    () =>
      user?.addresses[0] ?? {
        id: "addr-temp",
        fullName: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        postalCode: ""
      },
    [user]
  );
  const [address, setAddress] = useState<Address>(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState(paymentModes[0]);
  const [submitting, setSubmitting] = useState(false);

  // Block unauthenticated checkout
  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="text-xl font-semibold text-ink">Please log in to continue checkout.</p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 rounded-full bg-gradient-to-r from-brand to-brandSoft px-8 py-3 text-sm font-semibold text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  async function handleCheckout() {
    if (!items.length) return;
    setError(null);
    setSubmitting(true);

    try {
      saveAddress(address);

      // Step 1: Create Razorpay order on backend
      const paymentOrder = await createPaymentOrder({
        amount: subtotal * 100,
        currency: "INR",
        notes: { source: "customhub" }
      });

      if (!window.Razorpay) {
        setError("Razorpay failed to load. Please refresh the page and try again.");
        return;
      }

      // Step 2: Open Razorpay — only finalize AFTER successful payment + signature
      await new Promise<void>((resolve, reject) => {
        const razorpay = new window.Razorpay!({
          key: paymentOrder.key,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "CustomHub",
          description: "Premium custom commerce checkout",
          order_id: paymentOrder.id,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Step 3: Verify payment signature on backend FIRST
              const { verified } = await verifyPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              });

              if (!verified) {
                reject(new Error("Payment verification failed. Please contact support."));
                return;
              }

              // Step 4: Only now create the commerce order — linked to verified payment
              await createCommerceOrder({
                items,
                shippingAddress: address,
                paymentMethod,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                token: token ?? undefined
              });

              clearCart();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled.")),
          },
          theme: {
            color: "#8f1d48"
          }
        });

        razorpay.open();
      });

      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-steel">Checkout</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">
                Fast, polished and secure.
              </h1>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card">
              <h2 className="text-xl font-semibold text-ink">Shipping address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["fullName", "Full name"],
                  ["phone", "Phone"],
                  ["line1", "Address line 1"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal code"]
                ].map(([field, label]) => (
                  <label key={field} className="space-y-2">
                    <span className="text-sm font-medium text-ink">{label}</span>
                    <input
                      value={address[field as keyof Address] ?? ""}
                      onChange={(event) =>
                        setAddress((current) => ({
                          ...current,
                          id: current.id || `addr-${Date.now()}`,
                          [field]: event.target.value
                        }))
                      }
                      className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card">
              <h2 className="text-xl font-semibold text-ink">Payment method</h2>
              <div className="mt-5 grid gap-3">
                {paymentModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      paymentMethod === mode
                        ? "border-brand bg-blue-50 text-ink"
                        : "border-line bg-slate-50 text-steel"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-slate-950 p-7 text-white shadow-soft">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Summary</p>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[1.5rem] bg-white/5 px-4 py-4">
                  <div>
                    <p className="text-sm text-white/65">{item.product.category}</p>
                    <p className="mt-1 font-medium">{item.product.name}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {currency.format(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex justify-between text-sm text-white/70">
                <span>Total</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Payment rail</span>
                <span>{paymentMethod}</span>
              </div>
              <button
                type="button"
                disabled={submitting || items.length === 0}
                onClick={handleCheckout}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-brand to-brandSoft px-5 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Pay now"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
