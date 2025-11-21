import type { WatchlistItem } from "@/lib/dashboardData";
import WatchlistRow from "./WatchlistRow";

interface WatchlistCardProps {
  items: WatchlistItem[];
}

export default function WatchlistCard({ items }: WatchlistCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Watchlist
        </span>
        <span className="text-[11px] text-slate-500">
          {items.length} symbols
        </span>
      </div>
      <div className="space-y-3 text-xs">
        {items.map((item) => (
          <WatchlistRow key={item.symbol} {...item} />
        ))}
      </div>
    </div>
  );
}