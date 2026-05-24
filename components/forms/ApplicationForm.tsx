"use client"

import { useState } from "react"

interface ApplicationFormProps {
  initialData?: {
    id: string
    company: string
    role: string
    location?: string | null
    jobUrl?: string | null
    salary?: string | null
    status: "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER"
    notes?: string | null
  }
  onSubmitSuccess: () => void
  onCancel: () => void
}

export default function ApplicationForm({
  initialData,
  onSubmitSuccess,
  onCancel,
}: ApplicationFormProps) {
  const isEdit = !!initialData

  const [company, setCompany] = useState(initialData?.company || "")
  const [role, setRole] = useState(initialData?.role || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl || "")
  const [salary, setSalary] = useState(initialData?.salary || "")
  const [status, setStatus] = useState<"SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER">(
    initialData?.status || "SAVED"
  )
  const [notes, setNotes] = useState(initialData?.notes || "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!company.trim()) errors.company = "Company name is required"
    if (!role.trim()) errors.role = "Role title is required"
    
    if (jobUrl.trim()) {
      try {
        new URL(jobUrl)
      } catch {
        errors.jobUrl = "Please enter a valid URL (including http:// or https://)"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    const payload = {
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || null,
      jobUrl: jobUrl.trim() || null,
      salary: salary.trim() || null,
      status,
      notes: notes.trim() || null,
    }

    try {
      const url = isEdit ? `/api/applications/${initialData.id}` : "/api/applications"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to save application")
      }

      onSubmitSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-slate-100 font-sans">
      <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent border-b border-slate-800 pb-3">
        {isEdit ? "Edit Application" : "Track New Application"}
      </h2>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Grid Inputs for Company & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Company Name <span className="text-indigo-400">*</span>
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => {
              setCompany(e.target.value)
              if (validationErrors.company) {
                setValidationErrors((prev) => ({ ...prev, company: "" }))
              }
            }}
            placeholder="e.g. Google"
            className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
              validationErrors.company ? "border-rose-500 focus:ring-rose-500/30" : "border-slate-850 focus:border-indigo-500 focus:ring-indigo-500/40"
            } text-white rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-slate-600 text-sm`}
          />
          {validationErrors.company && (
            <p className="text-xs text-rose-400 mt-1">{validationErrors.company}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Role Title <span className="text-indigo-400">*</span>
          </label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              if (validationErrors.role) {
                setValidationErrors((prev) => ({ ...prev, role: "" }))
              }
            }}
            placeholder="e.g. Frontend Engineer"
            className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
              validationErrors.role ? "border-rose-500 focus:ring-rose-500/30" : "border-slate-850 focus:border-indigo-500 focus:ring-indigo-500/40"
            } text-white rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-slate-600 text-sm`}
          />
          {validationErrors.role && (
            <p className="text-xs text-rose-400 mt-1">{validationErrors.role}</p>
          )}
        </div>
      </div>

      {/* Grid Inputs for Status & Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="REJECTED">Rejected</option>
            <option value="OFFER">Offer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Salary Range (Optional)
          </label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. $110k - $130k"
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-600 text-sm"
          />
        </div>
      </div>

      {/* Grid Inputs for Location & Job URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New York, NY (Hybrid)"
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Job Posting URL (Optional)
          </label>
          <input
            type="text"
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value)
              if (validationErrors.jobUrl) {
                setValidationErrors((prev) => ({ ...prev, jobUrl: "" }))
              }
            }}
            placeholder="e.g. https://google.com/jobs/..."
            className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
              validationErrors.jobUrl ? "border-rose-500 focus:ring-rose-500/30" : "border-slate-850 focus:border-indigo-500 focus:ring-indigo-500/40"
            } text-white rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-slate-600 text-sm`}
          />
          {validationErrors.jobUrl && (
            <p className="text-xs text-rose-400 mt-1">{validationErrors.jobUrl}</p>
          )}
        </div>
      </div>

      {/* Notes Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Key tech stack, recruiter contact details, or follow-up timelines..."
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-850 text-white rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-600 text-sm resize-none"
        />
      </div>

      {/* Submit Button & Cancel */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEdit ? "Save Changes" : "Track Application"}</span>
          )}
        </button>
      </div>
    </form>
  )
}
