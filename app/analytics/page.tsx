"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase, Calendar, Target, Award, ArrowUpRight, ArrowDownRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { BarChart } from "@/components/charts/BarChart";
import { PieChart } from "@/components/charts/PieChart";
import { LineChart } from "@/components/charts/LineChart";
import { ProgressCard } from "@/components/charts/ProgressCard";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";

export default function AnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [overview, setOverview] = useState<any>(null);
  const [statusDistribution, setStatusDistribution] = useState<any>(null);
  const [interviewRates, setInterviewRates] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [overviewRes, statusRes, rateRes, timelineRes] = await Promise.all([
          fetch(`/api/analytics/overview?filter=${filter}`),
          fetch(`/api/analytics/status-distribution?filter=${filter}`),
          fetch(`/api/analytics/interview-rate?filter=${filter}`),
          fetch(`/api/analytics/applications-per-week?filter=${filter}`),
        ]);

        const [overviewData, statusData, rateData, timelineDataRes] = await Promise.all([
          overviewRes.json(),
          statusRes.json(),
          rateRes.json(),
          timelineRes.json(),
        ]);

        // Synthesize mock heatmap and trend data based on timeline for demonstration
        const mockHeatmapData = Array.from({ length: 30 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return {
            date: d.toISOString().split("T")[0],
            count: Math.floor(Math.random() * 5),
          };
        });

        const mockTrendData = Array.from({ length: 6 }).map((_, i) => ({
          month: new Date(new Date().setMonth(new Date().getMonth() - (5 - i))).toLocaleString('default', { month: 'short' }),
          interviews: Math.floor(Math.random() * 10) + 1
        }));

        setOverview(overviewData);
        setStatusDistribution(statusData);
        setInterviewRates(rateData);
        setTimelineData({
          ...timelineDataRes,
          heatmap: mockHeatmapData,
          trend: mockTrendData
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [sessionStatus, filter]);

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Track your job search performance and insights.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
            <p className="text-gray-500">Generating insights...</p>
          </div>
        ) : !overview || overview.total === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't tracked any applications for this period. Start applying to generate analytics!
            </p>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProgressCard
                title="Total Applications"
                value={overview.total}
                icon={<Briefcase className="w-6 h-6" />}
                description={overview.mostActiveMonth?.month ? `Most active: ${overview.mostActiveMonth.month}` : undefined}
                color="bg-blue-600"
              />
              <ProgressCard
                title="Interview Rate"
                value={`${interviewRates?.interviewRate?.toFixed(1) || 0}%`}
                icon={<Target className="w-6 h-6" />}
                progress={interviewRates?.interviewRate}
                color="bg-purple-500"
              />
              <ProgressCard
                title="Offer Rate"
                value={`${interviewRates?.offerRate?.toFixed(1) || 0}%`}
                icon={<Award className="w-6 h-6" />}
                progress={interviewRates?.offerRate}
                color="bg-green-500"
              />
              <ProgressCard
                title="Response Rate"
                value={`${interviewRates?.responseRate?.toFixed(1) || 0}%`}
                icon={<Calendar className="w-6 h-6" />}
                progress={interviewRates?.responseRate}
                color="bg-orange-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Application Timeline</h3>
                </div>
                <BarChart 
                  data={timelineData?.timeline || []} 
                  xKey={filter === "all" ? "week" : "date"} 
                  yKey="applications" 
                  fill="#3b82f6" 
                />
              </div>

              {/* Status Distribution & Heatmap */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Status Distribution</h3>
                <div className="flex-1 min-h-[200px]">
                  <PieChart 
                    data={statusDistribution?.statusDistribution || []} 
                    nameKey="name" 
                    dataKey="value" 
                  />
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">30-Day Activity Heatmap</h3>
                  <ActivityHeatmap data={timelineData?.heatmap || []} />
                </div>
              </div>
            </div>

            {/* Advanced Trend Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interview Trends */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Interview Trend (6 Months)</h3>
                <LineChart 
                  data={timelineData?.trend || []} 
                  xKey="month" 
                  yKey="interviews" 
                  stroke="#8b5cf6" 
                  height={200}
                />
              </div>
              
              {/* Top Companies */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Companies</h3>
                {overview.topCompanies && overview.topCompanies.length > 0 ? (
                  <div className="space-y-4">
                    {overview.topCompanies.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 truncate mr-2">{c.name}</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {c.applications}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No company data available.</p>
                )}
              </div>

              {/* Best Performing Resume */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Best Performing Resume</h3>
                {interviewRates?.bestPerformingResume ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-green-100 bg-green-50/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">
                          {interviewRates.bestPerformingResume.title} 
                          <span className="text-sm font-normal text-gray-500 ml-2">v{interviewRates.bestPerformingResume.version}</span>
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        This resume has the highest conversion rate to interviews.
                      </p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{interviewRates.bestPerformingResume.interviews}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Interviews</p>
                      </div>
                      <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {interviewRates.bestPerformingResume.interviewRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Conversion</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                    <p className="text-gray-500">Not enough data to determine resume performance.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
