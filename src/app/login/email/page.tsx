'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function EmailLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'We couldn\'t complete sign in right now. Please try again.')
      } else {
        router.push('/welcome')
      }
    } catch {
      setError('We couldn\'t complete sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">
      {/* 🔮 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full top-[-150px] left-1/2 -translate-x-1/2 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      
      <div className="w-full max-w-sm relative z-10 text-center space-y-8 animate-fadeUp">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/viyaan-logo.png"
            alt="Viyaan AI"
            width={54}
            height={54}
            className="rounded-xl shadow-lg shadow-purple-500/30"
          />
        </div>

        <div>
          <h1 className="text-3xl font-light text-white mb-2">Continue Your Journey</h1>
          <p className="text-white/50 text-sm">
            Sign in to continue your conversation with your future self.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition backdrop-blur focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
          />

          {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-accent hover:text-black transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>

        <p className="text-white/30 text-[10px] mt-8 leading-relaxed">
          Private by design.<br />
          Your reflections remain yours.
        </p>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeUp {
          animation: fadeUp 0.8s ease;
        }
      `}</style>
    </div>
  )
}
