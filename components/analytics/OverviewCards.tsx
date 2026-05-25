"use client";

import { BarChart3, Briefcase, Target, XCircle } from "lucide-react";

interface OverviewStats {
  total: number;
  interviews: number;
  offers: number;
  rejections: number;
  interviewRate: number;
  offerRate: number;
  rejectionRate: number;
  activeApplications: number;
}

export function OverviewCards({ stats }: { stats: OverviewStats }) {
  const cards = [
    {
      title: "Total Applications",
      value: stats.total.toString(),
      description: `${stats.activeApplications} active`,
      icon: Briefcase,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Interview Rate",
      value: `${stats.interviewRate.toFixed(1)}%`,
      description: `${stats.interviews} interviews`,
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Offer Rate",
      value: `${stats.offerRate.toFixed(1)}%`,
      description: `${stats.offers} offers`,
      icon: BarChart3,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Rejection Rate",
      value: `${stats.rejectionRate.toFixed(1)}%`,
      description: `${stats.rejections} rejections`,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-xl hover:bg-zinc-900/80 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">{card.title}</h3>
            <div className={`p-2 rounded-lg ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
            <p className="text-sm text-zinc-500">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
