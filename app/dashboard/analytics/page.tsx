"use client";

import { useEffect, useState } from "react";
import { OverviewCards } from "@/components/analytics/OverviewCards";
import { Charts } from "@/components/analytics/Charts";
import { CalendarDays, Loader2 } from "lucide-react";

export default function AnalyticsDashboard() {
  const [filter, setFilter] = useState("30days");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?filter=${filter}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [filter]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-450 mt-1">Track your search performance and application metrics.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg p-1">
          <CalendarDays className="w-4 h-4 text-zinc-400 ml-2" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 focus:outline-none focus:ring-0 border-none rounded-md py-1.5 px-3 hover:bg-zinc-800 transition-colors cursor-pointer appearance-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-zinc-500 text-sm">Crunching your numbers...</p>
        </div>
      ) : data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <OverviewCards stats={data.overview} />
          
          <Charts
            statusDistribution={data.overview.statusDistribution}
            timeline={data.timeline}
            topCompanies={data.topCompanies}
            resumePerformance={data.resumePerformance}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Failed to load analytics data.
        </div>
      )}
    </>
  );
}
