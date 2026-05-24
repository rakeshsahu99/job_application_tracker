"use client"

import { ExternalLink, Edit3, Trash2, MapPin, DollarSign, Briefcase } from "lucide-react"

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

interface ApplicationsTableProps {
  applications: JobApplication[]
  onStatusChange: (id: string, newStatus: JobApplication["status"]) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Record<JobApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
}

const STATUS_COLORS: Record<JobApplication["status"], { bg: string; text: string; border: string }> = {
  SAVED: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/20",
  },
  APPLIED: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20",
  },
  INTERVIEW: {
    bg: "bg-amber-500/10",
    text: "text-amber-350",
    border: "border-amber-500/20",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/20",
  },
  OFFER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
  },
}

export default function ApplicationsTable({
  applications,
  onStatusChange,
  onEdit,
  onDelete,
}: ApplicationsTableProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
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
                <tr key={app.id} className="hover:bg-slate-800/20 transition-all duration-150 group">
                  {/* Company & Role */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-200">
                          {app.company}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{app.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {app.location ? (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{app.location}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Salary */}
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {app.salary ? (
                      <div className="flex items-center gap-1.5 text-slate-350 font-medium">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <span>{app.salary}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border} focus:outline-none cursor-pointer appearance-none pr-7`}
                      >
                        <option value="SAVED">Saved</option>
                        <option value="APPLIED">Applied</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="OFFER">Offer</option>
                      </select>
                      <span className="absolute inset-y-0 right-2 flex items-center pr-1 pointer-events-none text-slate-400 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </td>

                  {/* Dynamic Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95"
                          title="Open job link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(app)}
                        className="p-2 text-indigo-400 hover:text-indigo-300 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95 cursor-pointer"
                        title="Edit application"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(app.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95 cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
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
  )
}
