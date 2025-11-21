import type { AlertItem, AlertAccent } from "@/lib/dashboardData";

type AlertRowProps = AlertItem;

export default function AlertRow({
  label,
  symbol,
  channel,
  status,
  accent,
}: AlertRowProps) {
  const pillMap: Record<AlertAccent, string> = {
    fuchsia:
      "border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-200",
    emerald:
      "border-emerald-400/60 bg-emerald-500/10 text-emerald-200",
    amber:
      "border-amber-400/60 bg-amber-500/10 text-amber-100",
  };

  const statusColor =
    status === "Firing" ? "text-fuchsia-300" : "text-emerald-300";

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-100">
          {label}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${pillMap[accent]}`}
        >
          {status}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>{symbol}</span>
        <span className={statusColor}>{channel}</span>
      </div>
    </div>
  );
}