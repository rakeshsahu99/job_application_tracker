"use client"

import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { BarChart, Bar } from "recharts"
import { TrendingUp, PieChart as PieIcon } from "lucide-react"

interface AnalyticsChartsProps {
  applications: any[]
}

const STATUS_COLORS: Record<string, string> = {
  SAVED: "#64748b", // slate
  APPLIED: "#6366f1", // indigo
  INTERVIEW: "#f59e0b", // amber
  REJECTED: "#f43f5e", // rose
  OFFER: "#10b981", // emerald
}

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
}

export default function AnalyticsCharts({ applications }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl h-[350px] animate-pulse" />
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl h-[350px] animate-pulse" />
      </div>
    )
  }

  // 1. Process Status Distribution Data
  const statusCounts: Record<string, number> = {
    SAVED: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    REJECTED: 0,
    OFFER: 0,
  }

  applications.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++
    }
  })

  const pieData = Object.keys(statusCounts)
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: statusCounts[status],
      color: STATUS_COLORS[status],
    }))
    .filter((item) => item.value > 0)

  // 2. Process Applications per Week Data (past 6 weeks)
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  const getWeekLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    // Get start of the week (Sunday)
    const day = d.getDay()
    const diff = d.getDate() - day
    const startOfWeek = new Date(d.setDate(diff))
    return startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Group applications by start-of-week date
  const weeklyGroups: Record<string, number> = {}

  // Initialize past 6 weeks with 0
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const label = getWeekLabel(d.toISOString())
    weeklyGroups[label] = 0
  }

  applications.forEach((app) => {
    const label = getWeekLabel(app.createdAt)
    if (weeklyGroups[label] !== undefined) {
      weeklyGroups[label]++
    } else {
      // If it lands outside our 6 weeks, just bucket it into the oldest week for simplicity,
      // or ignore if too old.
      const oldestLabel = Object.keys(weeklyGroups)[0]
      if (oldestLabel) {
        weeklyGroups[oldestLabel]++
      }
    }
  })

  const lineData = Object.keys(weeklyGroups).map((week) => ({
    name: week,
    Applications: weeklyGroups[week],
  }))

  const totalApplications = applications.length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Applications per Week Area Chart */}
      <div className="lg:col-span-2 p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Application Velocity</h3>
          </div>
          <p className="text-xs text-slate-400">Number of jobs tracked over the past 6 weeks</p>
        </div>

        <div className="h-[250px] w-full mt-6">
          {totalApplications === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-550 border border-dashed border-slate-850 rounded-xl">
              No velocity data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Applications"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorApplications)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Status Distribution</h3>
          </div>
          <p className="text-xs text-slate-400">Proportion of your pipeline stages</p>
        </div>

        <div className="h-[250px] w-full mt-6 relative flex flex-col items-center justify-center">
          {pieData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-550 border border-dashed border-slate-850 rounded-xl">
              No status distribution available
            </div>
          ) : (
            <>
              <div className="w-full h-[180px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(51, 65, 85, 0.5)",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Total count center label */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-100">{totalApplications}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Modern Custom Mini-Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-[-10px] max-w-xs">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-400">{entry.name}:</span>
                    <span className="text-slate-200">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
