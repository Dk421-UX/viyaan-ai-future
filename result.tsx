'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function ResultPage() {
  const router = useRouter()
  const [entry, setEntry] = useState<{ inputText: string; intensityBefore: number; generatedText: string } | null>(null)
  const [intensityAfter, setIntensityAfter] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('viyaan_entry')
    if (!raw) { router.push('/new-entry'); return }
    setEntry(JSON.parse(raw))
    setTimeout(() => setRevealed(true), 300)
  }, [router])

  async function handleSave() {
    if (!entry) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, intensityAfter }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setSaved(true)
      sessionStorage.removeItem('viyaan_entry')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!entry) return null

  const shift = entry.intensityBefore - intensityAfter
  const shiftColor = shift > 0 ? 'text-green-400' : shift < 0 ? 'text-red-400' : 'text-muted'
  const shiftLabel = shift > 0 ? `↓ ${shift} lighter` : shift < 0 ? `↑ ${Math.abs(shift)} heavier` : '— unchanged'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className={`w-full max-w-xl transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        <p className="text-xs tracking-[0.25em] text-muted uppercase mb-8 text-center">
          A message from your future self
        </p>

        {/* Reflection Card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <p className="text-white/90 leading-8 text-base font-light" style={{ fontFamily: 'Georgia, serif' }}>
            {entry.generatedText}
          </p>
          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
            <div>
              <p className="text-xs text-muted mb-1">You felt</p>
              <p className="text-sm text-white">{entry.inputText.slice(0, 80)}{entry.inputText.length > 80 ? '...' : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-1">Intensity</p>
              <p className="text-accent text-lg font-light">{entry.intensityBefore}<span className="text-muted text-xs">/10</span></p>
            </div>
          </div>
        </div>

        {/* After Intensity */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <p className="text-sm text-white mb-1">How do you feel now?</p>
          <p className="text-xs text-muted mb-6">After reading this reflection.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Intensity</span>
              <span className="text-sm text-white">{intensityAfter}/10</span>
            </div>
            <input
              type="range" min={1} max={10} value={intensityAfter}
              onChange={e => setIntensityAfter(Number(e.target.value))}
              className="intensity-slider w-full"
            />
          </div>
          {entry.intensityBefore !== intensityAfter && (
            <p className={`text-xs mt-3 ${shiftColor}`}>
              {shiftLabel} than before
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {saved ? (
          <div className="text-center py-4">
            <p className="text-green-400 text-sm">Saved. Returning to your timeline...</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 border border-border text-muted py-3 rounded-xl text-sm hover:border-white hover:text-white transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-2 flex-grow bg-white text-black py-3 rounded-xl text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save to timeline →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}