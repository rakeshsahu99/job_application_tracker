"use client";

import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PieChart({ data, nameKey, dataKey, colors = DEFAULT_COLORS, height = 300 }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
