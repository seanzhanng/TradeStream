"use client";

import { useEffect, useRef, useState } from "react";

export interface AnalyticsSnapshot {
  symbol: string;
  vwap: number;
  volatility: number;
  pctChange: number;
  avgVolume: number;
  volumeSpike: boolean;
  timestamp?: number;
}

interface AnalyticsState {
  analyticsBySymbol: Record<string, AnalyticsSnapshot>;
}

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export default function useAnalyticsData(symbols: string[], focusSymbol: string) {
  const [state, setState] = useState<AnalyticsState>({
    analyticsBySymbol: {},
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSymbols = symbols.length > 0;
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!hasSymbols || !symbolsKey) return;

    const wsUrl = `${WS_BASE_URL}/ws/analytics?symbols=${encodeURIComponent(
      symbolsKey
    )}`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🧮 Connected to analytics WS:", wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data) as {
            avg_volume: number;
            pct_change: number;
            symbol: string;
            timestamp: number;
            volatility: number;
            volume_spike: boolean;
            vwap: number;
          };

          const snapshot: AnalyticsSnapshot = {
            symbol: raw.symbol,
            vwap: raw.vwap,
            volatility: raw.volatility,
            pctChange: raw.pct_change,
            avgVolume: raw.avg_volume,
            volumeSpike: raw.volume_spike,
            timestamp: raw.timestamp,
          };

          setState((prev) => ({
            analyticsBySymbol: {
              ...prev.analyticsBySymbol,
              [snapshot.symbol]: snapshot,
            },
          }));
        } catch (err) {
          console.error("Analytics WS parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log("🔴 Analytics WS closed, retrying in 1500ms…");
        reconnectRef.current = setTimeout(connect, 1500);
      };

      ws.onerror = (err) => {
        console.error("⚠️ Analytics WS error:", err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [hasSymbols, symbolsKey]);

  const analyticsForFocus = state.analyticsBySymbol[focusSymbol];

  return {
    analyticsBySymbol: state.analyticsBySymbol,
    analyticsForFocus,
  };
}