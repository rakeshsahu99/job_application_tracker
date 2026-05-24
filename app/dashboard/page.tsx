"use client"

import { useState, useEffect, startTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LogoutButton from "@/components/dashboard/LogoutButton"
import ApplicationForm from "@/components/forms/ApplicationForm"

interface JobApplication {
  id: string
  company: string
  role: string
  location: string | null
  jobUrl: string | null
  salary: string | null
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER"
  notes: string | null
  createdAt: string
}

const STATUS_KEYS: Array<JobApplication["status"]> = ["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"]

const STATUS_LABELS: Record<JobApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
}

const STATUS_COLORS: Record<JobApplication["status"], { bg: string; text: string; border: string; glow: string }> = {
  SAVED: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/20",
    glow: "shadow-slate-500/5",
  },
  APPLIED: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/5",
  },
  INTERVIEW: {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/5",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/5",
  },
  OFFER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/5",
  },
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  // Application Data States
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"LIST" | "BOARD">("BOARD")

  // Modal Control States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
    }
  }, [sessionStatus, router])

  // Fetch Applications from API
  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL("/api/applications", window.location.origin)
      if (search) url.searchParams.append("query", search)
      if (statusFilter !== "ALL") url.searchParams.append("status", statusFilter)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch applications")
      
      const data = await res.json()
      setApplications(data)
    } catch (err: any) {
      console.error(err)
      setError("Unable to load job applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchApplications()
    }
  }, [sessionStatus, search, statusFilter])

  // Inline Status update
  const handleStatusChange = async (id: string, newStatus: JobApplication["status"]) => {
    // Optimistic Update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    )

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")
    } catch (err) {
      console.error(err)
      // Revert status on failure
      fetchApplications()
    }
  }

  // Delete Action
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete application")
      
      setApplications((prev) => prev.filter((app) => app.id !== id))
      setDeletingId(null)
    } catch (err) {
      console.error(err)
      alert("Failed to delete job application")
    }
  }

  // Statistics Calculation
  const statsCounts = STATUS_KEYS.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status).length
    return acc
  }, {} as Record<JobApplication["status"], number>)

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (sessionStatus === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden pb-12">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Dashboard Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, <span className="text-indigo-400 font-semibold">{session?.user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              + Track Application
            </button>
            <LogoutButton />
          </div>
        </header>

        {/* Stats Cards Section */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {STATUS_KEYS.map((status) => {
            const colors = STATUS_COLORS[status]
            const count = statsCounts[status]
            const isFiltering = statusFilter === status

            return (
              <button
                key={status}
                onClick={() => {
                  startTransition(() => {
                    setStatusFilter((prev) => (prev === status ? "ALL" : status))
                  })
                }}
                className={`p-5 bg-slate-900/60 backdrop-blur-xl border ${
                  isFiltering ? "border-indigo-500/60" : "border-slate-850"
                } rounded-2xl shadow-xl hover:border-slate-700/60 transition-all text-left flex items-center justify-between group relative overflow-hidden active:scale-95 ${colors.glow}`}
              >
                <div>
                  <span className="text-2xl font-black text-slate-100 block group-hover:scale-105 transition-transform">
                    {count}
                  </span>
                  <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider mt-1">
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border}`}>
                  <span className="text-xs font-bold">{STATUS_LABELS[status].charAt(0)}</span>
                </div>
              </button>
            )
          })}
        </section>

        {/* Filters and Toolbar */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6 p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-600 text-sm"
            />
          </div>

          {/* Controls: Status filter & View Toggles */}
          <div className="flex w-full sm:w-auto items-center justify-end gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer pr-10 relative"
            >
              <option value="ALL">All Statuses</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="REJECTED">Rejected</option>
              <option value="OFFER">Offer</option>
            </select>

            {/* Toggle View Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setViewMode("BOARD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "BOARD" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode("LIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "LIST" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </section>

        {/* Main Applications Content Display */}
        {error ? (
          <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-2xl">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchApplications} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs hover:bg-slate-700 transition-all border border-slate-750">
              Try Again
            </button>
          </div>
        ) : loading && applications.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-slate-400">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl text-center py-20">
            <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">No Applications Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              {search || statusFilter !== "ALL"
                ? "No job applications match your search criteria. Try adjusting your query or filters."
                : "Get started by adding your first job application details."}
            </p>
            <button
              onClick={() => {
                if (search || statusFilter !== "ALL") {
                  setSearch("")
                  setStatusFilter("ALL")
                } else {
                  setIsAddOpen(true)
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg active:scale-95"
            >
              {search || statusFilter !== "ALL" ? "Clear Filters" : "Track First Application"}
            </button>
          </div>
        ) : viewMode === "LIST" ? (
          /* ================= LIST VIEW ================= */
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Company & Role</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Salary</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {applications.map((app) => {
                    const colors = STATUS_COLORS[app.status]

                    return (
                      <tr key={app.id} className="hover:bg-slate-800/30 transition-all duration-150">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-100">{app.company}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{app.role}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {app.location || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {app.salary || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border} focus:outline-none cursor-pointer appearance-none pr-8 relative`}
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="OFFER">Offer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors"
                                title="Open Job posting link"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                            <button
                              onClick={() => setEditingApplication(app)}
                              className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors"
                              title="Edit application"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingId(app.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors"
                              title="Delete application"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= BOARD (KANBAN) VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            {STATUS_KEYS.map((status) => {
              const colors = STATUS_COLORS[status]
              const columnApps = applications.filter((app) => app.status === status)

              return (
                <div
                  key={status}
                  className="bg-slate-900/40 backdrop-blur-xl border border-slate-850/80 rounded-2xl p-4 flex flex-col min-h-[450px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-4">
                    <h3 className="text-sm font-bold text-slate-200 tracking-wide">
                      {STATUS_LABELS[status]}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-black rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl hover:border-slate-700/60 transition-all duration-200 shadow-md flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-bold text-slate-100 text-sm leading-tight group-hover:text-indigo-400 transition-colors">
                              {app.company}
                            </span>
                            <div className="flex items-center gap-1">
                              {app.jobUrl && (
                                <a
                                  href={app.jobUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium block mb-3">
                            {app.role}
                          </span>

                          <div className="space-y-1">
                            {app.location && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{app.location}</span>
                              </div>
                            )}
                            {app.salary && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1" />
                                </svg>
                                <span>{app.salary}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card bottom actions */}
                        <div className="mt-4 pt-3 border-t border-slate-850/50 flex items-center justify-between gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold ${colors.bg} ${colors.text} border ${colors.border} focus:outline-none cursor-pointer`}
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="OFFER">Offer</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingApplication(app)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors p-1 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-850"
                              title="Edit"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingId(app.id)}
                              className="text-rose-400 hover:text-rose-300 transition-colors p-1 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-850"
                              title="Delete"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {columnApps.length === 0 && (
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-850/60 rounded-xl py-8 text-slate-650 text-xs">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ================= ADD APPLICATION MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ApplicationForm
              onSubmitSuccess={() => {
                setIsAddOpen(false)
                fetchApplications()
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ================= EDIT APPLICATION MODAL ================= */}
      {editingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setEditingApplication(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ApplicationForm
              initialData={editingApplication}
              onSubmitSuccess={() => {
                setEditingApplication(null)
                fetchApplications()
              }}
              onCancel={() => setEditingApplication(null)}
            />
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete Job Application</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete this job application? This action is permanent and all associated mock interviews, reminders, and data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
