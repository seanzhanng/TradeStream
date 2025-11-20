"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface PricePoint {
  timestamp: number;
  price: number;
}

interface ChartCardProps {
  symbol: string;
  series: PricePoint[];
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  pctChange?: number;
}

export default function ChartCard({
  symbol,
  series,
  open,
  high,
  low,
  close,
  pctChange,
}: ChartCardProps) {
  const hasData = series.length > 1;

  const headerPctText =
    pctChange == null
      ? "—"
      : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`;

  const pctBadgeClass =
    pctChange == null
      ? "border-slate-500/40 bg-slate-500/10 text-slate-200"
      : pctChange >= 0
      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
      : "border-rose-400/60 bg-rose-500/10 text-rose-200";

  const data = hasData
    ? series.map((p) => ({
        timeLabel: new Date(p.timestamp * 1000).toLocaleTimeString(),
        price: p.price,
      }))
    : [];

  return (
    <div className="relative flex h-72 flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/70 shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-linear-to-r from-emerald-500/10 via-sky-500/10 to-fuchsia-500/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            {symbol} • Price
          </span>
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] border " + pctBadgeClass
            }
          >
            {headerPctText}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>O: {open != null ? open.toFixed(2) : "—"}</span>
          <span>H: {high != null ? high.toFixed(2) : "—"}</span>
          <span>L: {low != null ? low.toFixed(2) : "—"}</span>
          <span>C: {close != null ? close.toFixed(2) : "—"}</span>
        </div>
      </div>

      {/* Chart body */}
      <div className="flex flex-1 items-center justify-center text-[12px] text-slate-500 px-2 pb-2 pt-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                minTickGap={20}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickFormatter={(value: number) => value.toFixed(2)}
              />
              <Tooltip
                formatter={(value) => [`$${(value as number).toFixed(2)}`, "Price"]}
                labelStyle={{ fontSize: 11 }}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                dot={false}
                strokeWidth={1.8}
                stroke="#22c55e"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 w-[90%] rounded-xl border border-dashed border-slate-700/80 bg-linear-to-tr from-slate-900 via-slate-900/60 to-slate-800/60 flex items-center justify-center">
            Waiting for price data…
          </div>
        )}
      </div>
    </div>
  );
}
