"use client";

import BackgroundGlow from "@/components/layout/BackgroundGlow";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ChartCard from "@/components/dashboard/ChartCard";
import MetricGrid from "@/components/dashboard/MetricGrid";
import StreamPanel from "@/components/dashboard/StreamPanel";
import WatchlistCard from "@/components/watchlist/WatchlistCard";
import AlertsCard from "@/components/alerts/AlertsCard";
import { ALERT_ITEMS, WATCHLIST_ITEMS } from "@/lib/dashboardData";
import useDashboardData from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const { focusSymbol, metrics, streamEvents } = useDashboardData();

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
              symbol={focusSymbol}
              priceChangePercent="+1.42%"
              open="188.3"
              high="192.1"
              low="187.9"
              close="191.4"
            />

            <MetricGrid metrics={metrics} />

            <StreamPanel events={streamEvents} />
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
