// app/page.tsx
import BackgroundGlow from "@/components/layout/BackgroundGlow";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ChartCard from "@/components/dashboard/ChartCard";
import MetricGrid from "@/components/dashboard/MetricGrid";
import StreamPanel from "@/components/dashboard/StreamPanel";
import WatchlistCard from "@/components/watchlist/WatchlistCard";
import AlertsCard from "@/components/alerts/AlertsCard";
import {
  ALERT_ITEMS,
  METRIC_DEFINITIONS,
  STREAM_EVENTS,
  WATCHLIST_ITEMS,
  FOCUS_SYMBOL,
} from "@/lib/dashboardData";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <BackgroundGlow />

      <Sidebar activeItem="Dashboard" />

      <main className="flex flex-1 flex-col px-6 py-6">
        <TopBar />

        <section className="mt-5 flex flex-1 gap-5 overflow-hidden">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <ChartCard
              symbol={FOCUS_SYMBOL}
              priceChangePercent="+1.42%"
              open="188.3"
              high="192.1"
              low="187.9"
              close="191.4"
            />

            <MetricGrid metrics={METRIC_DEFINITIONS} />

            <StreamPanel events={STREAM_EVENTS} />
          </div>

          {/* Right column: watchlist + alerts */}
          <div className="hidden w-80 flex-col gap-4 lg:flex xl:w-96">
            <WatchlistCard items={WATCHLIST_ITEMS} />
            <AlertsCard alerts={ALERT_ITEMS} />
          </div>
        </section>
      </main>
    </div>
  );
}
