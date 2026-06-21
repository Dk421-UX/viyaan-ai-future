'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MockGooglePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMockLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/google/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to simulate login.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">
      {/* 🔮 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full top-[-150px] left-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-sm relative z-10 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-light text-white">Google OAuth Simulation</h1>
          <p className="text-xs text-accent uppercase tracking-wider font-mono mt-1">Local Sandbox Mode</p>
          <p className="text-xs text-muted mt-2 max-w-xs mx-auto leading-relaxed">
            Google Client Credentials are not configured in your <code className="text-white/80 font-mono">.env</code>. Enter any email to simulate a login callback.
          </p>
        </div>

        <form onSubmit={handleMockLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="dev-user@example.com"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-accent transition"
          >
            {loading ? 'Simulating authenticate...' : 'Simulate Google Authentication'}
          </button>
        </form>
      </div>
    </div>
  )
}