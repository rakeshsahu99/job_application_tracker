"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white rounded-xl text-sm font-medium transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-slate-200" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </>
      )}
    </button>
  )
}
