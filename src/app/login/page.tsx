'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">

      {/* 🔮 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full top-[-150px] left-1/2 -translate-x-1/2 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="w-full max-w-sm relative z-10">

        {/* Header */}
        <div className="mb-12 text-center animate-fadeUp">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/viyaan-logo.png"
              alt="Viyaan AI"
              width={54}
              height={54}
              className="rounded-xl shadow-lg shadow-purple-500/30"
            />
          </div>

          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-3">
            VIYAAN FUTURE
          </p>

          <h1 className="text-3xl font-medium mb-2">
            Welcome back.
          </h1>

          <p className="text-white/50 text-sm">
            Continue your reflection journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fadeUp">

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 focus:border-purple-400 focus:outline-none transition backdrop-blur focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 focus:border-purple-400 focus:outline-none transition backdrop-blur focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
            />

            {/* 👁 Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white transition"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-600 hover:scale-[1.01] hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-8">
          No account?{' '}
          <Link href="/signup" className="text-purple-300 hover:text-purple-200 transition">
            Create one
          </Link>
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