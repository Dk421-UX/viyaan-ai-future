'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/signup')
    }, 1500) // smooth delay

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <img
        src="/viyaan-logo.png"
        alt="Viyaan AI"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          marginBottom: '16px',
        }}
      />

      {/* Brand */}
      <h1
        style={{
          fontSize: '18px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          marginBottom: '6px',
        }}
      >
        Viyaan AI
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.04em',
        }}
      >
        Reflect. Reset. Move forward.
      </p>

      {/* Loading */}
      <div
        style={{
          marginTop: '24px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        Preparing your space…
      </div>
    </div>
  )
}