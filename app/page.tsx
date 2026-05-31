"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Briefcase, Sparkles, Cpu, BarChart3, ArrowRight, Lock, Zap, CheckCircle2 } from "lucide-react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            HireFlow AI
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/login?register=true"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-16 flex-1 flex flex-col justify-center items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold mb-6 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Job Application Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Supercharge Your Job Search With <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI Automation</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          HireFlow AI integrates intelligent resume optimization, Playwright-powered background form submission, interactive pipelines, and conversion analytics in one unified workflow.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-base"
            >
              <span>Access Your Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login?register=true"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-base"
              >
                <span>Track Applications Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 hover:text-white font-bold rounded-2xl transition-all cursor-pointer text-base"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Groq AI Matching</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyze and score your resume alignment with any job description. Instantly extract missing skills and optimize keywords.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-violet-500/40 transition-all duration-300 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Background Auto-Apply</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automate the tedious form-filling on Greenhouse, Lever, and other major boards with our robust Playwright browser agent.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-850 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Advanced Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Monitor interview rates, status conversion distributions, and weekly application velocities via responsive visual reports.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>&copy; {new Date().getFullYear()} HireFlow AI. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
