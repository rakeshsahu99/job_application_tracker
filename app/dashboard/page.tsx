import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import LogoutButton from "@/components/dashboard/LogoutButton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Redirect to login if user is not authenticated (extra guard, though middleware covers this)
  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch some quick dashboard stats scoped to the user
  const [appCount, resumeCount] = await Promise.all([
    prisma.jobApplication.count({ where: { userId: session.user.id } }),
    prisma.resume.count({ where: { userId: session.user.id } }),
  ])

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
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
              Welcome back, <span className="text-indigo-400 font-semibold">{session.user.name}</span>
            </p>
          </div>
          <LogoutButton />
        </header>

        {/* Hero Section / Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Welcome & Info Card */}
          <div className="md:col-span-2 p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 inline-block mb-4">
                Active Session
              </span>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Track & Automate Your Job Search</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Ready to take the next step in your career? Upload your resumes, add job applications, schedule mock interviews, and trigger automatic follow-up reminders.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">
                + New Application
              </button>
              <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 font-semibold text-sm rounded-xl transition-all active:scale-[0.98]">
                Upload Resume
              </button>
            </div>
          </div>

          {/* User Details Box */}
          <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4">Security Profile</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider block">Logged In As</span>
                  <span className="text-sm font-medium text-slate-300 block truncate">{session.user.email}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider block">User ID</span>
                  <code className="text-xs font-mono text-indigo-300 block truncate bg-slate-950 p-2 rounded-lg mt-1 border border-slate-800/40">
                    {session.user.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-100">{appCount}</span>
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider mt-0.5">Job Applications</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-100">{resumeCount}</span>
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider mt-0.5">Uploaded Resumes</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-100">0</span>
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider mt-0.5">Interviews Slated</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-100">0</span>
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider mt-0.5">Automations Running</span>
            </div>
          </div>
        </div>

        {/* Detailed Application Table Area / Empty State */}
        <div className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">No Applications Tracked Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            Get started by adding your first job application or uploading a resume to automatically extract fields.
          </p>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
            Add First Application
          </button>
        </div>
      </div>
    </div>
  )
}
