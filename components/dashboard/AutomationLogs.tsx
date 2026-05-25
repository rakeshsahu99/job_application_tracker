"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, PlayCircle } from "lucide-react"

interface AutomationTask {
  id: string
  platform: string
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"
  logs: string | null
  retryCount: number
  createdAt: string
  completedAt: string | null
  application?: {
    company: string
    role: string
  }
}

export default function AutomationLogs() {
  const [tasks, setTasks] = useState<AutomationTask[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/automation")
      if (!res.ok) throw new Error("Failed to load automation logs")
      const data = await res.json()
      setTasks(data)
    } catch (err: any) {
      console.error(err)
      setError("Unable to load automation logs.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // Poll every 10 seconds for updates
    const interval = setInterval(() => {
      fetchTasks()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTasks()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      case "FAILED": return <XCircle className="w-5 h-5 text-rose-400" />
      case "RUNNING": return <PlayCircle className="w-5 h-5 text-amber-400 animate-pulse" />
      case "QUEUED": return <Clock className="w-5 h-5 text-slate-400" />
      default: return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseStyle = "px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit"
    switch (status) {
      case "COMPLETED": 
        return <div className={`${baseStyle} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>Completed</div>
      case "FAILED": 
        return <div className={`${baseStyle} bg-rose-500/10 text-rose-400 border-rose-500/20`}>Failed</div>
      case "RUNNING": 
        return <div className={`${baseStyle} bg-amber-500/10 text-amber-400 border-amber-500/20`}>Running</div>
      case "QUEUED": 
        return <div className={`${baseStyle} bg-slate-800 text-slate-300 border-slate-700`}>Queued</div>
      default: 
        return <div className={`${baseStyle} bg-slate-800 text-slate-300 border-slate-700`}>{status}</div>
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl overflow-hidden flex flex-col w-full shadow-xl">
      <div className="flex justify-between items-center p-5 border-b border-slate-850/60">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Background Automation Logs
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider border border-indigo-500/30">
              Live
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Monitor the status of your automated background tasks in real-time</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-750 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="p-6 text-center">
          <div className="inline-flex bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-950/20">
          <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
          No automation tasks have been executed yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Platform</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Target Application</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Started At</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Retries</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase w-full">Logs / Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      {getStatusBadge(task.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {task.platform}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {task.application ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{task.application.company}</span>
                        <span className="text-xs text-slate-500">{task.application.role}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(task.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${task.retryCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                      {task.retryCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl truncate text-slate-400 font-mono text-xs" title={task.logs || "No logs available"}>
                      {task.logs || "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
