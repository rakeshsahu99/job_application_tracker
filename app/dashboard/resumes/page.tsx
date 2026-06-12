"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Trash2, Loader2, Calendar, Star, Tag, Plus } from "lucide-react"
import toast from "react-hot-toast"
import LogoutButton from "@/components/dashboard/LogoutButton"

interface Resume {
  id: string
  title: string
  resumeUrl: string
  parsedText: string | null
  skills: string[]
  tags: string[]
  isDefault: boolean
  uploadedAt: string
}

export default function ResumesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Tagging states
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth protection
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/resumes")
    }
  }, [sessionStatus, router])

  // Fetch resumes
  const fetchResumes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/resumes")
      if (!res.ok) throw new Error("Failed to fetch resumes")
      const data = await res.json()
      setResumes(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load resumes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchResumes()
    }
  }, [sessionStatus])

  // Handle Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadTitle.trim() || !uploadFile) {
      toast.error("Please provide both a title and a PDF file.")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("title", uploadTitle.trim())
    formData.append("file", uploadFile)

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to upload resume")
      }

      toast.success("Resume uploaded and parsed successfully!")
      setUploadTitle("")
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      fetchResumes()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete resume")

      toast.success("Resume deleted permanently")
      setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete resume")
    } finally {
      setDeletingId(null)
    }
  }

  // Handle Set Default
  const handleSetDefault = async (id: string) => {
    // Optimistic update
    setResumes((prev) => prev.map(r => ({ ...r, isDefault: r.id === id })))
    
    try {
      const res = await fetch(`/api/resumes/${id}/default`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to set default")
      toast.success("Default resume updated")
    } catch (error) {
      console.error(error)
      toast.error("Failed to set default resume")
      fetchResumes() // Revert
    }
  }

  // Handle Add Tag
  const handleAddTag = async (id: string, currentTags: string[]) => {
    const newTag = tagInputs[id]?.trim()
    if (!newTag || currentTags.includes(newTag)) return

    const updatedTags = [...currentTags, newTag]
    
    // Optimistic update
    setResumes(prev => prev.map(r => r.id === id ? { ...r, tags: updatedTags } : r))
    setTagInputs(prev => ({ ...prev, [id]: "" }))

    try {
      const res = await fetch(`/api/resumes/${id}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags })
      })
      if (!res.ok) throw new Error("Failed to update tags")
    } catch (error) {
      console.error(error)
      toast.error("Failed to add tag")
      fetchResumes() // Revert
    }
  }

  // Handle Remove Tag
  const handleRemoveTag = async (id: string, currentTags: string[], tagToRemove: string) => {
    const updatedTags = currentTags.filter(t => t !== tagToRemove)
    
    // Optimistic update
    setResumes(prev => prev.map(r => r.id === id ? { ...r, tags: updatedTags } : r))

    try {
      const res = await fetch(`/api/resumes/${id}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags })
      })
      if (!res.ok) throw new Error("Failed to update tags")
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove tag")
      fetchResumes() // Revert
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (sessionStatus === "unauthenticated") return null

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Resume Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload and manage your resumes. We automatically extract key skills for AI matching.
          </p>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 sticky top-8 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Upload className="w-5 h-5 text-indigo-400" />
                Upload Resume
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Resume Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Software Engineer 2026"
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    PDF File (Max 5MB)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors group bg-slate-950/30">
                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <FileText className={`w-8 h-8 mb-3 ${uploadFile ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-500"}`} />
                      <p className="text-sm font-medium text-slate-300">
                        {uploadFile ? uploadFile.name : "Click or drag file here"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF only"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={uploading || !uploadTitle || !uploadFile}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upload & Parse"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-6">Your Resumes</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm text-slate-400">Loading resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/20">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-300 mb-2">No resumes yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Upload your first resume to get started. We'll extract your skills to help tailor your applications.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className={`bg-slate-900/60 border ${resume.isDefault ? 'border-amber-500/50' : 'border-slate-800'} rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg flex flex-col sm:flex-row gap-5 relative`}>
                    
                    {/* Default Badge */}
                    {resume.isDefault && (
                      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-950" /> Default
                      </div>
                    )}

                    {/* Resume Icon & Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg border ${resume.isDefault ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-100 text-lg leading-tight hover:text-indigo-400 transition-colors">
                              <a href={resume.resumeUrl} target="_blank" rel="noopener noreferrer">
                                {resume.title}
                              </a>
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(resume.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Tags */}
                      <div className="mt-4 border-t border-slate-800 pt-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Labels
                        </p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {resume.tags?.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-800/80 text-slate-300 text-[11px] font-medium rounded border border-slate-700 flex items-center gap-1">
                              {tag}
                              <button onClick={() => handleRemoveTag(resume.id, resume.tags, tag)} className="hover:text-rose-400 ml-0.5">×</button>
                            </span>
                          ))}
                          <form 
                            onSubmit={(e) => { e.preventDefault(); handleAddTag(resume.id, resume.tags || []); }}
                            className="flex items-center"
                          >
                            <input
                              type="text"
                              placeholder="Add label..."
                              value={tagInputs[resume.id] || ""}
                              onChange={e => setTagInputs(prev => ({ ...prev, [resume.id]: e.target.value }))}
                              className="bg-slate-950/50 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-white w-24 focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
                            />
                            <button type="submit" className="ml-1 p-0.5 text-slate-500 hover:text-indigo-400 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Extracted Skills Tags */}
                      <div className="mt-4 border-t border-slate-800 pt-3">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Extracted Skills</p>
                        {resume.skills && resume.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {resume.skills.slice(0, 8).map(skill => (
                              <span key={skill} className="px-1.5 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-medium rounded border border-slate-850">
                                {skill}
                              </span>
                            ))}
                            {resume.skills.length > 8 && (
                              <span className="px-1.5 py-0.5 bg-slate-950 text-slate-500 text-[10px] font-medium rounded border border-slate-850">
                                +{resume.skills.length - 8} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-600 italic">No standard skills detected.</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-4">
                      {!resume.isDefault && (
                        <button
                          onClick={() => handleSetDefault(resume.id)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold rounded-lg transition-colors w-full text-center border border-amber-500/20 flex items-center justify-center gap-1.5"
                        >
                          <Star className="w-3 h-3" /> Set Default
                        </button>
                      )}
                      <a
                        href={resume.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors w-full text-center border border-slate-700"
                      >
                        View PDF
                      </a>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        disabled={deletingId === resume.id}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition-colors border border-rose-500/20 w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingId === resume.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
    </>
  )
}
