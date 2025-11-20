"use client";

import { useMemo } from "react";
import { METRIC_DEFINITIONS, FOCUS_SYMBOL } from "@/lib/dashboardData";
import useMarketData, { TickEvent } from "@/hooks/useMarketData";
import useAnalyticsData from "@/hooks/useAnalyticsData";

const SUBSCRIBED_SYMBOLS = ["AAPL", "SPY", "ETH-USD"] as const;

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

export default function useDashboardData() {
  const {
    streamEvents,
    lastTickForFocus,
    historyForFocus,
  } = useMarketData(
    SUBSCRIBED_SYMBOLS as unknown as string[],
    FOCUS_SYMBOL
  );

  const { analyticsForFocus } = useAnalyticsData(
    SUBSCRIBED_SYMBOLS as unknown as string[],
    FOCUS_SYMBOL
  );

  // Build price series for chart from tick history
  const priceSeries: PricePoint[] = useMemo(
    () =>
      (historyForFocus as TickEvent[]).map((tick) => ({
        timestamp: tick.timestamp,
        price: tick.price,
      })),
    [historyForFocus]
  );

  // Compute O/H/L/C + % change over the visible window
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

  return {
    focusSymbol: FOCUS_SYMBOL,
    subscribedSymbols: SUBSCRIBED_SYMBOLS,
    metrics,
    streamEvents,
    priceSeries,
    priceSummary,
    lastTickForFocus,
    analyticsForFocus,
  };
}