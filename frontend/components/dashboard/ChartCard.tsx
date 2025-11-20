// components/dashboard/ChartCard.tsx

interface ChartCardProps {
  symbol: string;
  priceChangePercent: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export default function ChartCard({
  symbol,
  priceChangePercent,
  open,
  high,
  low,
  close,
}: ChartCardProps) {
  return (
    <div className="relative flex h-72 flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/70 shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
      <div className="border-b border-slate-800/80 bg-linear-to-r from-emerald-500/10 via-sky-500/10 to-fuchsia-500/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            {symbol} • Price
          </span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-400/40">
            {priceChangePercent}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>O: {open}</span>
          <span>H: {high}</span>
          <span>L: {low}</span>
          <span>C: {close}</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center text-[12px] text-slate-500">
        <div className="h-40 w-[90%] rounded-xl border border-dashed border-slate-700/80 bg-linear-to-tr from-slate-900 via-slate-900/60 to-slate-800/60 flex items-center justify-center">
          Chart goes here (Plotly / D3)
        </div>
      </div>
    </div>
  );
}