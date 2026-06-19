import { cn } from "@/lib/utils";

const stages = ["placed", "confirmed", "production", "shipped", "delivered"] as const;

export function OrderTimeline({ status }: { status: string }) {
  const activeIndex = stages.indexOf(status as (typeof stages)[number]);

  return (
    <div className="grid gap-4 sm:grid-cols-5">
      {stages.map((stage, index) => {
        const active = index <= activeIndex;

        return (
          <div key={stage} className="flex items-center gap-3 sm:block">
            <div
              className={cn(
                "h-3 w-3 rounded-full transition",
                active ? "bg-brand shadow-[0_0_0_8px_rgba(143,29,72,0.12)]" : "bg-rose-200"
              )}
            />
            <div className="sm:mt-4">
              <p className={cn("text-xs uppercase tracking-[0.28em]", active ? "text-brand" : "text-steel")}>
                {stage}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
