import type { ReactNode } from "react";

export function Panel({
  label,
  code,
  children,
  className = "",
  status = "NOMINAL",
  statusTone = "primary",
}: {
  label: string;
  code?: string;
  children: ReactNode;
  className?: string;
  status?: string;
  statusTone?: "primary" | "destructive" | "amber" | "muted";
}) {
  const toneClass =
    statusTone === "destructive" ? "text-destructive" :
    statusTone === "amber" ? "text-amber" :
    statusTone === "muted" ? "text-muted-foreground" :
    "text-primary";
  return (
    <div className={`relative rounded-sm border border-border bg-panel/80 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-primary pulse-ring" />
          <span>{label}</span>
          {code && <span className="text-muted-foreground/60">// {code}</span>}
        </div>
        <span className={`${toneClass}`}>{status}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
