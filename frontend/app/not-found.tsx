import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-6 py-16 text-center">
      <div className="premium-panel-strong rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-steel">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-steel">
          This page does not exist or is no longer available.
        </p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
          Go home
        </Link>
      </div>
    </div>
  );
}
