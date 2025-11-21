"use client";

import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboardData";
import useSystemHealth from "@/hooks/useSystemHealth";

interface SidebarProps {
  activeItem?: string;
}

export default function Sidebar({ activeItem = "Dashboard" }: SidebarProps) {
  const { kafka } = useSystemHealth();
  const kafkaOnline = kafka === "online";

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col border-r border-slate-800/80 bg-slate-950/70 px-5 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Market
          </div>
          <div className="bg-linear-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-xl font-semibold text-transparent">
            Tradestream
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 border border-emerald-400/40">
          Live
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = item === activeItem;
          return (
            <button
              key={item}
              type="button"
              className={
                isActive
                  ? "flex items-center justify-between rounded-xl border border-emerald-400/50 bg-linear-to-r from-emerald-500/25 via-sky-500/15 to-transparent px-3 py-2 text-[13px] font-medium text-slate-50 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
                  : "flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium text-slate-300 hover:bg-slate-800/60 hover:text-slate-50 transition"
              }
            >
              <span>{item}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>Kafka</span>
          <span
            className={
              "flex items-center gap-1 " +
              (kafkaOnline ? "text-emerald-300" : "text-rose-300")
            }
          >
            <span
              className={
                "h-2 w-2 rounded-full " +
                (kafkaOnline
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                  : "bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]")
              }
            />
            {kafkaOnline ? "Online" : "Offline"}
          </span>
        </div>

        <div className="pt-2 text-[10px] text-slate-600">
          v0.1 • internal
        </div>
      </div>
    </aside>
  );
}