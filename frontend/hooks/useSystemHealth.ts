"use client";

import { useEffect, useState } from "react";

type Status = "online" | "offline";

interface SystemHealth {
  kafka: Status;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function useSystemHealth(): SystemHealth {
  const [health, setHealth] = useState<SystemHealth>({
    kafka: "offline",
  });

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchHealth() {
      try {
        const url = `${API_BASE_URL}/api/health`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`bad status ${res.status}`);
        }

        const data = await res.json();

        if (!isMounted) return;

        setHealth({
          kafka: data.kafka ? "online" : "offline",
        });
      } catch (err) {
        console.error("[health] error:", err);
        if (!isMounted) return;
        setHealth({
          kafka: "offline",
        });
      }
    }

    fetchHealth();
    interval = setInterval(fetchHealth, 10_000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  return health;
}