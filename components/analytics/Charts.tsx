"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  SAVED: "#64748b", // slate-500
  APPLIED: "#3b82f6", // blue-500
  INTERVIEW: "#10b981", // emerald-500
  OFFER: "#a855f7", // purple-500
  REJECTED: "#f43f5e", // rose-500
};

interface ChartsProps {
  statusDistribution: { name: string; value: number }[];
  timeline: { date: string; applications: number }[];
  topCompanies: { name: string; applications: number }[];
  resumePerformance: { title: string; total: number; interviews: number; interviewRate: number }[];
}

export function Charts({ statusDistribution, timeline, topCompanies, resumePerformance }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Activity Timeline */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Activity Timeline</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                itemStyle={{ color: "#e4e4e7" }}
              />
              <Area type="monotone" dataKey="applications" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Application Pipeline */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Application Pipeline</h3>
        <div className="h-[300px] w-full">
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#52525b"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              No data available
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {statusDistribution.map((status, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[status.name as keyof typeof COLORS] || "#52525b" }}
              />
              <span className="text-zinc-400 capitalize">{status.name.toLowerCase()}</span>
              <span className="text-white font-medium">{status.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Top Companies Applied</h3>
        <div className="h-[300px] w-full">
          {topCompanies.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCompanies} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#a1a1aa" width={100} />
                <Tooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                />
                <Bar dataKey="applications" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Resume Performance */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Resume Performance (Interview Rate)</h3>
        <div className="h-[300px] w-full">
          {resumePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="title" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Interview Rate']}
                />
                <Bar dataKey="interviewRate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
