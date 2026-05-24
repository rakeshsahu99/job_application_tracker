"use client"

import { Bookmark, Send, Calendar, XCircle, Award } from "lucide-react"

interface StatsCardsProps {
  applications: any[]
  statusFilter: string
  onStatusFilterChange: (status: string) => void
}

const STATUS_KEYS = ["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"] as const

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
}

const STATUS_ICONS: Record<string, any> = {
  SAVED: Bookmark,
  APPLIED: Send,
  INTERVIEW: Calendar,
  REJECTED: XCircle,
  OFFER: Award,
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  SAVED: {
    bg: "bg-slate-500/10",
    text: "text-slate-350",
    border: "border-slate-500/20",
    glow: "shadow-slate-500/5 hover:shadow-slate-500/10",
  },
  APPLIED: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-350",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/5 hover:shadow-indigo-500/10",
  },
  INTERVIEW: {
    bg: "bg-amber-500/10",
    text: "text-amber-350",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/5 hover:shadow-amber-500/10",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-350",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/5 hover:shadow-rose-500/10",
  },
  OFFER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-350",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/5 hover:shadow-emerald-500/10",
  },
}

export default function StatsCards({
  applications,
  statusFilter,
  onStatusFilterChange,
}: StatsCardsProps) {
  // Calculate counts dynamically
  const statsCounts = STATUS_KEYS.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {STATUS_KEYS.map((status) => {
        const colors = STATUS_COLORS[status]
        const count = statsCounts[status]
        const isFiltering = statusFilter === status
        const IconComponent = STATUS_ICONS[status]

        return (
          <button
            key={status}
            onClick={() => onStatusFilterChange(isFiltering ? "ALL" : status)}
            className={`p-5 bg-slate-900/60 backdrop-blur-xl border ${
              isFiltering ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-slate-850"
            } rounded-2xl shadow-xl hover:border-slate-700 transition-all text-left flex items-center justify-between group relative overflow-hidden active:scale-98 cursor-pointer ${colors.glow}`}
          >
            {/* Ambient Background Hover Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-slate-800/10`} />

            <div>
              <span className="text-3xl font-extrabold text-slate-100 block tracking-tight group-hover:scale-105 transition-transform duration-300">
                {count}
              </span>
              <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider mt-1.5">
                {STATUS_LABELS[status]}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} group-hover:rotate-6 transition-all duration-300`}>
              <IconComponent className="w-5 h-5" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
