"use client"

import { useState, useEffect, startTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, LayoutGrid, List as ListIcon, Plus, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { exportToCSV, exportToPDF } from "@/utils/export"

import LogoutButton from "@/components/dashboard/LogoutButton"
import ApplicationForm from "@/components/forms/ApplicationForm"
import StatsCards from "@/components/dashboard/StatsCards"
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts"
import ApplicationsTable from "@/components/dashboard/ApplicationsTable"
import KanbanBoard from "@/components/dashboard/KanbanBoard"
import AutomationLogs from "@/components/dashboard/AutomationLogs"

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

  // Status transition update with optimistic state & toasts
  const handleStatusChange = async (id: string, newStatus: JobApplication["status"]) => {
    const previousApplications = [...applications]
    
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
      toast.success(`Moved to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}!`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update application status")
      // Revert status on failure
      setApplications(previousApplications)
    }
  }

  // Delete Action with toast
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete application")
      
      setApplications((prev) => prev.filter((app) => app.id !== id))
      setDeletingId(null)
      toast.success("Application removed successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete application")
    }
  }

  // Trigger queue-based auto-apply automation
  const handleTriggerAutomation = async (applicationId: string, jobUrl: string) => {
    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobUrl }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to queue automation")

      toast.success("Job automation task successfully queued!")
    } catch (err: any) {
      console.error("Failed to run automation:", err)
      toast.error(err.message || "Failed to trigger automation")
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    )
  }

  if (sessionStatus === "unauthenticated") {
    return null
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Job Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Accelerate your search and manage active automation tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

        {/* Dashboard Analytics Section */}
        <section className="mb-8">
          <AnalyticsCharts applications={applications} />
        </section>

        {/* Dynamic Glassmorphic Stats Counters */}
        <section className="mb-8">
          <StatsCards
            applications={applications}
            statusFilter={statusFilter}
            onStatusFilterChange={(status) => {
              startTransition(() => {
                setStatusFilter(status)
              })
            }}
          />
        </section>

        {/* Filters and Toolbar Controls */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6 p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl">
          {/* Magnifying Search & Saved Searches */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or role..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-955/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-600 text-sm"
              />
            </div>
            
            <select
              onChange={(e) => {
                if (e.target.value === "clear") setSearch("")
                else setSearch(e.target.value)
              }}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-800 text-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer pr-8 relative"
            >
              <option value="clear">Saved Searches...</option>
              <option value="Software Engineer">Software Engineer Roles</option>
              <option value="Google">Google Applications</option>
              <option value="Remote">Remote Jobs</option>
            </select>
          </div>

          {/* Controls toolbar */}
          <div className="flex w-full sm:w-auto items-center justify-end gap-3 flex-wrap">
            <div className="flex gap-2 mr-2">
              <button
                onClick={() => exportToCSV(applications)}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                CSV
              </button>
              <button
                onClick={() => exportToPDF(applications)}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                PDF
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-955/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer pr-10 relative"
            >
              <option value="ALL">All Statuses</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Toggle View Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setViewMode("BOARD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "BOARD" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode("LIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "LIST" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Main Contents Display */}
        {error ? (
          <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-2xl">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchApplications} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs hover:bg-slate-700 transition-all border border-slate-750 cursor-pointer">
              Try Again
            </button>
          </div>
        ) : loading && applications.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-4" />
            <p className="text-sm text-slate-400">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl text-center py-20 shadow-xl">
            <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Search className="w-8 h-8" />
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {search || statusFilter !== "ALL" ? "Clear Filters" : "Track First Application"}
            </button>
          </div>
        ) : viewMode === "LIST" ? (
          <ApplicationsTable
            applications={applications}
            onStatusChange={handleStatusChange}
            onEdit={setEditingApplication}
            onDelete={setDeletingId}
            onTriggerAutomation={handleTriggerAutomation}
          />
        ) : (
          <KanbanBoard
            applications={applications}
            onStatusChange={handleStatusChange}
            onEdit={setEditingApplication}
            onDelete={setDeletingId}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}
        
        {/* Automation Logs Section */}
        <section className="mt-8">
          <AutomationLogs />
        </section>


      {/* ================= ADD APPLICATION MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <ApplicationForm
              onSubmitSuccess={() => {
                setIsAddOpen(false)
                fetchApplications()
                toast.success("Application tracked successfully!")
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
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <ApplicationForm
              initialData={editingApplication}
              onSubmitSuccess={() => {
                setEditingApplication(null)
                fetchApplications()
                toast.success("Application details updated!")
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
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-450 border border-rose-500/20 flex items-center justify-center mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete Job Application</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete this job application? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
