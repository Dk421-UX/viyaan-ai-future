'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EntryData } from './src/types'
import React from 'react'

interface Props {
  entries: EntryData[]
  email: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function DashboardClient({ entries, email }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const avgBefore = entries.length
    ? Math.round(
        (entries.reduce((a, e) => a + e.intensityBefore, 0) /
          entries.length) * 10
      ) / 10
    : null

  const avgAfter = entries.filter(e => e.intensityAfter !== null).length
    ? Math.round(
        (entries
          .filter(e => e.intensityAfter !== null)
          .reduce((a, e) => a + (e.intensityAfter ?? 0), 0) /
          entries.filter(e => e.intensityAfter !== null).length) * 10
      ) / 10
    : null

  return (
    <div
      className="min-h-screen px-4 py-10 max-w-2xl mx-auto"
      style={{
        background:
          'radial-gradient(circle at 50% -10%, rgba(139,92,246,0.08), transparent 60%), #080808'
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-3">
          <img
            src="/viyaan-logo.png"
            alt="logo"
            className="w-9 h-9 rounded-xl"
            style={{ boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
          />

          <div>
            <p className="text-xs tracking-[0.3em] text-muted uppercase mb-1">
              Viyaan AI
            </p>
            <h1 className="text-xl font-light">Your timeline.</h1>
            <p className="text-muted text-xs mt-1">{email}</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => router.push('/new-entry')}
            className="text-xs font-medium px-4 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #fff, #e9e9ff)',
              color: '#000',
              boxShadow: '0 6px 20px rgba(139,92,246,0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            + New entry
          </button>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="text-muted text-xs hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* STATS */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Total', value: entries.length },
            { label: 'Before', value: avgBefore ? `${avgBefore}/10` : '—' },
            { label: 'After', value: avgAfter ? `${avgAfter}/10` : '—' }
          ].map(s => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-4"
              style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p
                className="text-white text-lg font-light"
                style={{
                  textShadow: '0 0 15px rgba(139,92,246,0.15)'
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {entries.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-2">No entries yet.</p>
          <p className="text-muted text-xs">
            Begin by speaking to your future self.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const shift =
              entry.intensityAfter !== null
                ? entry.intensityBefore - entry.intensityAfter
                : null

            const isOpen = expanded === entry.id

            return (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
                style={{
                  transition: 'all 0.25s ease',
                  transform: isOpen ? 'scale(1.01)' : 'scale(1)'
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center"
                >
                  <div className="flex-1 mr-4">
                    <p className="text-xs text-muted mb-1">
                      {formatDate(entry.createdAt)}
                    </p>

                    <p className="text-sm text-white">
                      {entry.inputText.length > 80
                        ? entry.inputText.slice(0, 80) + '...'
                        : entry.inputText}
                    </p>
                  </div>

                  {/* RIGHT SIDE DATA */}
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {entry.intensityBefore}/10
                    </p>

                    {shift !== null && (
                      <p className="text-xs text-green-400 mt-1">
                        ↓ {shift}
                      </p>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <p className="text-white/80 text-sm leading-relaxed italic">
                      {entry.generatedText}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}