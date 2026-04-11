'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EntryData } from '../types'

interface Props {
  entries: EntryData[]
  email: string
}

function intensityColor(v: number) {
  if (v <= 3) return 'text-green-400'
  if (v <= 6) return 'text-accent'
  return 'text-red-400'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardClient({ entries, email }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/login')
  }

  const avgBefore = entries.length
    ? Math.round((entries.reduce((a, e) => a + e.intensityBefore, 0) / entries.length) * 10) / 10
    : null
  const withAfter = entries.filter(e => e.intensityAfter !== null)
  const avgAfter = withAfter.length
    ? Math.round(
        (withAfter.reduce((a, e) => a + (e.intensityAfter ?? 0), 0) / withAfter.length) * 10,
      ) / 10
    : null

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-12">
        <div>
          <p className="text-xs tracking-[0.3em] text-muted uppercase mb-2">Viyaan Future</p>
          <h1 className="text-xl font-light">Your timeline.</h1>
          <p className="text-muted text-xs mt-1">{email}</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={() => router.push('/new-entry')}
            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-accent transition-colors"
          >
            + New entry
          </button>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="text-muted text-xs hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Total entries', value: entries.length },
            { label: 'Avg. before', value: avgBefore ? `${avgBefore}/10` : '—' },
            { label: 'Avg. after', value: avgAfter ? `${avgAfter}/10` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="text-white text-lg font-light">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-2">No entries yet.</p>
          <p className="text-muted text-xs">Begin by speaking to your future self.</p>
          <button
            type="button"
            onClick={() => router.push('/new-entry')}
            className="mt-6 border border-border text-white text-xs px-5 py-2 rounded-lg hover:border-accent hover:text-accent transition-colors"
          >
            Start your first entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const shift = entry.intensityAfter !== null ? entry.intensityBefore - entry.intensityAfter : null
            const isOpen = expanded === entry.id
            return (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center"
                >
                  <div className="flex-1 mr-4">
                    <p className="text-xs text-muted mb-1">{formatDate(entry.createdAt)}</p>
                    <p className="text-sm text-white line-clamp-1">{entry.inputText}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-light ${intensityColor(entry.intensityBefore)}`}>
                        {entry.intensityBefore}/10
                      </p>
                      {shift !== null && (
                        <p
                          className={`text-xs ${shift > 0 ? 'text-green-400' : shift < 0 ? 'text-red-400' : 'text-muted'}`}
                        >
                          {shift > 0 ? `↓${shift}` : shift < 0 ? `↑${Math.abs(shift)}` : '—'}
                        </p>
                      )}
                    </div>
                    <span className={`text-muted text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4 animate-in">
                    <p className="text-xs text-muted uppercase tracking-widest mb-3">Your future self said</p>
                    <p className="text-white/80 text-sm leading-7" style={{ fontFamily: 'Georgia, serif' }}>
                      {entry.generatedText}
                    </p>
                    {entry.intensityAfter !== null && (
                      <div className="flex gap-6 mt-5 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted">Before</p>
                          <p className={`text-sm ${intensityColor(entry.intensityBefore)}`}>{entry.intensityBefore}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">After</p>
                          <p className={`text-sm ${intensityColor(entry.intensityAfter)}`}>{entry.intensityAfter}/10</p>
                        </div>
                        {shift !== null && (
                          <div>
                            <p className="text-xs text-muted">Shift</p>
                            <p
                              className={`text-sm ${shift > 0 ? 'text-green-400' : shift < 0 ? 'text-red-400' : 'text-muted'}`}
                            >
                              {shift > 0 ? `${shift} lighter` : shift < 0 ? `${Math.abs(shift)} heavier` : 'unchanged'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
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
