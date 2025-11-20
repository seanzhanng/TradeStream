// components/alerts/AlertsCard.tsx
import type { AlertItem } from "@/lib/dashboardData";
import AlertRow from "./AlertRow";

interface AlertsCardProps {
  alerts: AlertItem[];
}

export default function AlertsCard({ alerts }: AlertsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Active alerts
        </span>
        <button className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-sky-300 border border-sky-500/40">
          + New
        </button>
      </div>
      <div className="space-y-3 text-xs">
        {alerts.map((alert) => (
          <AlertRow key={alert.label + alert.symbol} {...alert} />
        ))}
      </div>
    </div>
  );
}
