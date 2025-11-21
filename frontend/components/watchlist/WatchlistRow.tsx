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
          <div className={`text-[10px] ${colorMap[changeColor]}`}>
            {change}
          </div>
        </div>
      </div>
    </div>
  );
}