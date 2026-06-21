'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  email: string
  totalEntries: number
  joinDate: string
}

export default function ProfileClient({ email, totalEntries, joinDate }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/login')
  }

  return (
    <div className="space-y-6">
      {/* 🧠 OS Metrics Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">Account Diagnostics</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between border-b border-border/40 pb-2 text-xs">
            <span className="text-muted">User Email</span>
            <span className="text-white font-medium">{email}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2 text-xs">
            <span className="text-muted">Member Since</span>
            <span className="text-white font-medium">{joinDate}</span>
          </div>
          <div className="flex justify-between pb-1 text-xs">
            <span className="text-muted">Total Reflections Logged</span>
            <span className="text-white font-medium">{totalEntries}</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full border border-red-950/20 bg-red-950/5 text-red-400 py-3 rounded-xl text-xs font-medium hover:bg-red-900/10 hover:border-red-900/30 transition-all"
      >
        {loggingOut ? 'Signing out of session...' : 'Terminate Growth OS Session (Sign out)'}
      </button>
    </div>
  )
}
