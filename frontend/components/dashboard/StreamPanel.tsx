import type { StreamEvent, StreamEventType } from "@/lib/dashboardData";
import { MAX_STREAM_EVENTS } from "@/lib/dashboardData";

interface StreamPanelProps {
  events: StreamEvent[];
}

const typeClassMap: Record<StreamEventType, string> = {
  tick: "text-slate-300",
  analytics: "text-emerald-300",
  alert: "text-fuchsia-300",
};

export default function StreamPanel({ events }: StreamPanelProps) {
  return (
    <div className="flex-1 rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 text-xs text-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Stream
        </span>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700">
          latest {MAX_STREAM_EVENTS} events
        </span>
      </div>
      <div className="mt-1 space-y-1.5 overflow-auto pr-1 max-h-40">
        {events.map((event) => (
          <p key={event.id} className={typeClassMap[event.type]}>
            {event.text}
          </p>
        ))}
      </div>
    </div>
  );
}
