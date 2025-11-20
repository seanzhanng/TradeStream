// components/watchlist/WatchlistRow.tsx
import type {
  WatchlistItem,
  WatchlistChangeColor,
} from "@/lib/dashboardData";

type WatchlistRowProps = WatchlistItem;

export default function WatchlistRow({
  symbol,
  name,
  price,
  change,
  changeColor,
}: WatchlistRowProps) {
  const colorMap: Record<WatchlistChangeColor, string> = {
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    rose: "text-rose-300",
  };

  const barMap: Record<WatchlistChangeColor, string> = {
    emerald: "from-emerald-400 to-emerald-500",
    sky: "from-sky-400 to-sky-500",
    rose: "from-rose-400 to-rose-500",
  };

  return (
    <div className="rounded-xl bg-slate-900/60 px-3 py-2 border border-slate-800/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-100">
            {symbol}
          </div>
          <div className="text-[10px] text-slate-500">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-100">{price}</div>
          <div className={`text-[10px] ${colorMap[changeColor]}`}>{change}</div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={`h-full w-2/3 rounded-full bg-linear-to-r ${barMap[changeColor]}`}
        />
      </div>
    </div>
  );
}