import type { MetricDefinition } from "@/lib/dashboardData";
import MetricCard from "./MetricCard";

interface MetricGridProps {
  metrics: MetricDefinition[];
}

export default function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          accent={metric.accent}
        />
      ))}
    </div>
  );
}