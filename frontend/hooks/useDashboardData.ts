"use client";

import { useMemo } from "react";
import {
  METRIC_DEFINITIONS,
  FOCUS_SYMBOL,
  WATCHLIST_ITEMS,
} from "@/lib/dashboardData";
import type {
  WatchlistItem,
  WatchlistChangeColor,
} from "@/lib/dashboardData";
import useMarketData, { TickEvent } from "@/hooks/useMarketData";
import useAnalyticsData from "@/hooks/useAnalyticsData";

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface PriceSummary {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  pctChange?: number;
}

// Subscribe to all symbols that appear in the watchlist
const SUBSCRIBED_SYMBOLS = Array.from(
  new Set([
    FOCUS_SYMBOL,
    ...WATCHLIST_ITEMS.map((item) => item.symbol),
  ])
) as string[];

export default function useDashboardData() {
  const {
    streamEvents,
    lastTickForFocus,
    historyForFocus,
    ticksBySymbol,
  } = useMarketData(SUBSCRIBED_SYMBOLS, FOCUS_SYMBOL);

  const { analyticsForFocus } = useAnalyticsData(
    SUBSCRIBED_SYMBOLS,
    FOCUS_SYMBOL
  );

  // ---- Price series for chart ----
  const priceSeries: PricePoint[] = useMemo(
    () =>
      (historyForFocus as TickEvent[]).map((tick) => ({
        timestamp: tick.timestamp,
        price: tick.price,
      })),
    [historyForFocus]
  );

  // ---- O/H/L/C + % over visible window ----
  const priceSummary: PriceSummary = useMemo(() => {
    if (priceSeries.length === 0) {
      return {};
    }

    const open = priceSeries[0].price;
    const close = priceSeries[priceSeries.length - 1].price;

    let high = open;
    let low = open;

    for (const point of priceSeries) {
      if (point.price > high) high = point.price;
      if (point.price < low) low = point.price;
    }

    const pctChange =
      open !== 0 ? ((close - open) / open) * 100 : undefined;

    return { open, high, low, close, pctChange };
  }, [priceSeries]);

  // ---- Metrics row ----
  const metrics = useMemo(
    () =>
      METRIC_DEFINITIONS.map((metric) => {
        // Last Tick from tick WS
        if (metric.label === "Last Tick" && lastTickForFocus) {
          return {
            ...metric,
            value: `$${lastTickForFocus.price.toFixed(
              2
            )} • ${lastTickForFocus.volume}`,
          };
        }

        // If no analytics yet, keep static placeholders
        if (!analyticsForFocus) {
          return metric;
        }

        // VWAP from analytics
        if (metric.label === "VWAP") {
          return {
            ...metric,
            value: `$${analyticsForFocus.vwap.toFixed(2)}`,
          };
        }

        // Use pct_change for the "Spread" card for now
        if (metric.label === "Spread") {
          const pct = analyticsForFocus.pctChange * 100; // 0.84 -> 84%
          const sign = pct >= 0 ? "+" : "";
          return {
            ...metric,
            value: `${sign}${pct.toFixed(2)}%`,
          };
        }

        // Volatility (5m)
        if (metric.label.startsWith("Volatility")) {
          return {
            ...metric,
            value: `${analyticsForFocus.volatility.toFixed(2)}%`,
          };
        }

        return metric;
      }),
    [lastTickForFocus, analyticsForFocus]
  );

  // ---- Live watchlist ----
  const watchlistItems: WatchlistItem[] = useMemo(
    () =>
      WATCHLIST_ITEMS.map((item) => {
        const liveTick = ticksBySymbol[item.symbol];

        // No live data yet → fall back to static item
        if (!liveTick) {
          return item;
        }

        const currentPrice = liveTick.price;
        const priceStr = currentPrice.toFixed(2);

        // Treat the static price as "previous close" for % change
        const baseline = parseFloat(item.price.replace(/,/g, ""));
        let changeStr = item.change;
        let changeColor: WatchlistChangeColor = item.changeColor;

        if (!Number.isNaN(baseline) && baseline > 0) {
          const pctChange = ((currentPrice - baseline) / baseline) * 100;
          const sign = pctChange >= 0 ? "+" : "";
          changeStr = `${sign}${pctChange.toFixed(2)}%`;

          if (pctChange > 0.001) changeColor = "emerald";
          else if (pctChange < -0.001) changeColor = "rose";
          else changeColor = "sky";
        }

        return {
          ...item,
          price: priceStr,
          change: changeStr,
          changeColor,
        };
      }),
    [ticksBySymbol]
  );

  return {
    focusSymbol: FOCUS_SYMBOL,
    subscribedSymbols: SUBSCRIBED_SYMBOLS,
    metrics,
    streamEvents,
    priceSeries,
    priceSummary,
    lastTickForFocus,
    analyticsForFocus,
    watchlistItems,
  };
}