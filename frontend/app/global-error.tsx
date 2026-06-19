"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <p style={{ color: "#7d5b6b", fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>CustomHub</p>
            <h1 style={{ marginTop: 16, color: "#381425", fontSize: 36 }}>Something went wrong</h1>
            <p style={{ color: "#7d5b6b", lineHeight: 1.7 }}>
              The application hit an unexpected error while loading.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 999,
                background: "#8f1d48",
                color: "white",
                padding: "12px 22px",
                fontWeight: 700
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
