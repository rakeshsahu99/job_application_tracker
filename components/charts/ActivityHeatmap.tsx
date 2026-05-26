"use client";

import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface HeatmapProps {
  data: { date: string; count: number }[];
}

export function ActivityHeatmap({ data }: HeatmapProps) {
  // Generate last 30 days
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  // Map data to a fast lookup
  const dataMap = new Map(data?.map((d) => [d.date, d.count]) || []);

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100";
    if (count < 3) return "bg-indigo-200";
    if (count < 5) return "bg-indigo-400";
    if (count < 10) return "bg-indigo-600";
    return "bg-indigo-800";
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1">
        {days.map((day, i) => {
          const count = dataMap.get(day) || 0;
          return (
            <React.Fragment key={day}>
              <div
                data-tooltip-id="heatmap-tooltip"
                data-tooltip-content={`${count} applications on ${new Date(day).toLocaleDateString()}`}
                className={`w-4 h-4 rounded-sm ${getColor(count)} transition-all hover:ring-2 hover:ring-indigo-400 cursor-pointer`}
              />
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-indigo-200" />
          <div className="w-3 h-3 rounded-sm bg-indigo-400" />
          <div className="w-3 h-3 rounded-sm bg-indigo-600" />
          <div className="w-3 h-3 rounded-sm bg-indigo-800" />
        </div>
        <span>More</span>
      </div>
      
      <ReactTooltip id="heatmap-tooltip" className="z-50 !bg-slate-900 !text-white !rounded-lg !text-xs !py-1 !px-2" />
    </div>
  );
}
