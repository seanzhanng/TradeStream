import type { MetricAccent } from "@/lib/dashboardData";

export interface MetricCardProps {
  label: string;
  value: string;
  accent: MetricAccent;
}

export default function MetricCard({ label, value, accent }: MetricCardProps) {
  const accentMap: Record<MetricAccent, string> = {
    emerald: "from-emerald-400 to-emerald-500",
    sky: "from-sky-400 to-sky-500",
    amber: "from-amber-400 to-amber-500",
    fuchsia: "from-fuchsia-400 to-fuchsia-500",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.7)]">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-10 h-16 bg-linear-to-r ${accentMap[accent]} opacity-20 blur-3xl`}
      />
      <div className="relative text-[11px] text-slate-400">{label}</div>
      <div className="relative mt-2 text-lg font-semibold text-slate-50">
        {value}
      </div>
    </div>
  );
}