"use client";

import { useEffect, useRef, useState } from "react";
import type { StreamEvent } from "@/lib/dashboardData";
import { MAX_STREAM_EVENTS, MAX_TICK_HISTORY } from "@/lib/dashboardData";

export interface TickEvent {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

interface MarketDataState {
  ticksBySymbol: Record<string, TickEvent>;
  tickHistoryBySymbol: Record<string, TickEvent[]>;
  streamEvents: StreamEvent[];
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export default function useMarketData(symbols: string[], focusSymbol: string) {
  const [state, setState] = useState<MarketDataState>({
    ticksBySymbol: {},
    tickHistoryBySymbol: {},
    streamEvents: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSymbols = symbols.length > 0;
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!hasSymbols || !symbolsKey) return;

    const wsUrl = `${WS_BASE_URL}/ws/ticks?symbols=${encodeURIComponent(
      symbolsKey
    )}`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 Connected to", wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data) as {
            symbol: string;
            price: number;
            volume: number;
            timestamp: number;
          };

          setState((prev) => {
            const tick: TickEvent = {
              symbol: raw.symbol,
              price: raw.price,
              volume: raw.volume,
              timestamp: raw.timestamp,
            };

            const nextTicks = {
              ...prev.ticksBySymbol,
              [tick.symbol]: tick,
            };

            const prevHistoryForSymbol =
              prev.tickHistoryBySymbol[tick.symbol] ?? [];
            const nextHistoryForSymbol = [
              ...prevHistoryForSymbol,
              tick,
            ].slice(-MAX_TICK_HISTORY);

            const nextHistoryBySymbol = {
              ...prev.tickHistoryBySymbol,
              [tick.symbol]: nextHistoryForSymbol,
            };

            const timeStr = new Date(
              tick.timestamp * 1000
            ).toLocaleTimeString();

            const newEvent: StreamEvent = {
              id: `${raw.symbol}-${raw.timestamp}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              type: "tick",
              text: `[${timeStr}] ${tick.symbol} • $${tick.price.toFixed(
                2
              )} @ ${tick.volume}`,
              symbol: tick.symbol,
            };

            return {
              ticksBySymbol: nextTicks,
              tickHistoryBySymbol: nextHistoryBySymbol,
              streamEvents: [
                newEvent,
                ...prev.streamEvents,
              ].slice(0, MAX_STREAM_EVENTS),
            };
          });
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log("🔴 WS closed, retrying in 1500ms…");
        reconnectRef.current = setTimeout(connect, 1500);
      };

      ws.onerror = (err) => {
        console.error("⚠️ WS error:", err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [hasSymbols, symbolsKey]);

  const lastTickForFocus = state.ticksBySymbol[focusSymbol];
  const historyForFocus = state.tickHistoryBySymbol[focusSymbol] ?? [];

  return {
    ticksBySymbol: state.ticksBySymbol,
    tickHistoryBySymbol: state.tickHistoryBySymbol,
    streamEvents: state.streamEvents,
    lastTickForFocus,
    historyForFocus,
  };
}