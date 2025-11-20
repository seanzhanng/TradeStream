"use client";

import { useMemo } from "react";
import {
  METRIC_DEFINITIONS,
  FOCUS_SYMBOL,
} from "@/lib/dashboardData";
import useMarketData from "@/hooks/useMarketData";
import useAnalyticsData from "@/hooks/useAnalyticsData";

const SUBSCRIBED_SYMBOLS = ["AAPL", "SPY", "ETH-USD"] as const;

export default function useDashboardData() {
  const { streamEvents, lastTickForFocus } = useMarketData(
    SUBSCRIBED_SYMBOLS as unknown as string[],
    FOCUS_SYMBOL
  );

  const { analyticsForFocus } = useAnalyticsData(
    SUBSCRIBED_SYMBOLS as unknown as string[],
    FOCUS_SYMBOL
  );

  const metrics = useMemo(
    () =>
      METRIC_DEFINITIONS.map((metric) => {
        // Last Tick from tick WS
        if (metric.label === "Last Tick" && lastTickForFocus) {
          return {
            ...metric,
            value: `$${lastTickForFocus.price.toFixed(2)} • ${
              lastTickForFocus.volume
            }`,
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
    lastTickForFocus,
    analyticsForFocus,
  };
}
