// lib/dashboardData.ts

// Sidebar
export const DASHBOARD_NAV_ITEMS = [
  "Dashboard",
  "Watchlist",
  "Live Data",
  "Alerts",
  "History",
  "Settings",
];

export const FOCUS_SYMBOL = "AAPL";

// ---- Metrics ----

export type MetricAccent = "emerald" | "sky" | "amber" | "fuchsia";

export interface MetricDefinition {
  label: string;
  value: string;
  accent: MetricAccent;
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  { label: "VWAP", value: "$189.32", accent: "emerald" },
  { label: "Spread", value: "$0.04", accent: "sky" },
  { label: "Volatility (5m)", value: "12.4%", accent: "amber" },
  { label: "Last Tick", value: "$191.41 • 240", accent: "fuchsia" },
];

// ---- Stream events ----

export type StreamEventType = "tick" | "analytics" | "alert";

export interface StreamEvent {
  type: StreamEventType;
  text: string;
}

export const STREAM_EVENTS: StreamEvent[] = [
  { type: "tick", text: "[12:30:01.120] Tick • 189.30 @ 500" },
  { type: "analytics", text: "[12:30:01.125] Analytics • VWAP(5m) → 189.18" },
  { type: "alert", text: "[12:30:01.200] ALERT • Spread > 0.05 (AAPL)" },
  { type: "tick", text: "[12:30:02.010] Tick • 189.31 @ 240" },
  { type: "tick", text: "[12:30:02.540] Tick • 189.33 @ 120" },
  { type: "analytics", text: "[12:30:03.002] Analytics • Vol(5m) → 12.4%" },
];

// ---- Watchlist ----

export type WatchlistChangeColor = "emerald" | "sky" | "rose";

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeColor: WatchlistChangeColor;
}

export const WATCHLIST_ITEMS: WatchlistItem[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "191.41",
    change: "+1.42%",
    changeColor: "emerald",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500",
    price: "525.32",
    change: "+0.58%",
    changeColor: "sky",
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum",
    price: "3,421.77",
    change: "-2.12%",
    changeColor: "rose",
  },
];

// ---- Alerts ----

export type AlertStatus = "Firing" | "Armed";
export type AlertAccent = "fuchsia" | "emerald" | "amber";

export interface AlertItem {
  label: string;
  symbol: string;
  channel: string;
  status: AlertStatus;
  accent: AlertAccent;
}

export const ALERT_ITEMS: AlertItem[] = [
  {
    label: "Spread > 0.05",
    symbol: "AAPL",
    channel: "Slack • #trading",
    status: "Firing",
    accent: "fuchsia",
  },
  {
    label: "5m VWAP cross 190",
    symbol: "AAPL",
    channel: "Email",
    status: "Armed",
    accent: "emerald",
  },
  {
    label: "Vol(15m) > 20%",
    symbol: "SPY",
    channel: "SMS",
    status: "Armed",
    accent: "amber",
  },
];