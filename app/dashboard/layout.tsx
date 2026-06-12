"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Loader2, 
  Menu, 
  X, 
  User,
  ArrowRight
} from "lucide-react"
import LogoutButton from "@/components/dashboard/LogoutButton"

interface SidebarLink {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { name: "Job Tracker", href: "/dashboard", icon: Briefcase },
  { name: "Resume Manager", href: "/dashboard/resumes", icon: FileText },
  { name: "AI Resume Match", href: "/dashboard/ai-match", icon: Sparkles },
  { name: "Performance Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Global authentication guard
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
    }
  }, [sessionStatus, router])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading HireFlow AI Workspace...</p>
      </div>
    )
  }

  if (sessionStatus === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900/40 backdrop-blur-xl border-b border-slate-850/80 w-full relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            HireFlow AI
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 border border-slate-800/60 active:scale-95 transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fadeIn pt-20 px-6 pb-6">
          <nav className="flex-1 flex flex-col gap-2 mt-4">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm border transition-all ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-auto border-t border-slate-850/60 pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-200 truncate">{session?.user?.name || "Premium User"}</div>
                <div className="text-[10px] text-slate-500 truncate">{session?.user?.email}</div>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-slate-950/40 backdrop-blur-xl border-r border-slate-850/80 flex-col justify-between p-6 relative z-10 min-h-screen">
        <div className="flex flex-col gap-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              HireFlow AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-lg shadow-indigo-500/5 font-extrabold"
                      : "text-slate-450 border-transparent hover:text-slate-250 hover:bg-slate-900/40 hover:border-slate-850/40"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout bottom */}
        <div className="border-t border-slate-850/60 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-slate-900/30 p-3.5 rounded-xl border border-slate-850/40 hover:border-slate-850 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-200 truncate">{session?.user?.name || "Premium User"}</div>
              <div className="text-[10px] text-slate-500 truncate">{session?.user?.email}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* DYNAMIC CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 min-h-0">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>

    </div>
  )
}
