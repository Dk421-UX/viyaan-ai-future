'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function NewEntryPage() {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim() || inputText.trim().length < 10) {
      setError('Please share a bit more about how you feel.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: inputText.trim(), intensityBefore: intensity }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); setLoading(false); return }

      // Store in sessionStorage for result page
      sessionStorage.setItem('viyaan_entry', JSON.stringify({
        inputText: inputText.trim(),
        intensityBefore: intensity,
        generatedText: data.data.generatedText,
      }))
      router.push('/result')
    } catch {
      setError('Failed to generate reflection. Please try again.')
      setLoading(false)
    }
  }

  const intensityLabel = intensity <= 3 ? 'Low' : intensity <= 6 ? 'Moderate' : intensity <= 8 ? 'High' : 'Intense'
  const intensityColor = intensity <= 3 ? 'text-green-400' : intensity <= 6 ? 'text-accent' : 'text-red-400'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl animate-in">
        <div className="mb-10">
          <button onClick={() => router.push('/dashboard')} className="text-muted text-xs hover:text-white transition-colors mb-8 flex items-center gap-2">
            ← Back
          </button>
          <p className="text-xs tracking-[0.25em] text-muted uppercase mb-3">New Entry</p>
          <h1 className="text-2xl font-light">How are you feeling right now?</h1>
        </div>

        <form onSubmit={handleGenerate} className="space-y-8">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Be honest. No one is watching. Write what's actually happening inside..."
            rows={6}
            maxLength={2000}
            className="w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-white placeholder:text-muted focus:border-accent transition-colors leading-relaxed"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted">Emotional intensity</p>
              <span className={`text-sm font-medium ${intensityColor}`}>
                {intensity}/10 — {intensityLabel}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="intensity-slider w-full"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>Calm</span>
              <span>Overwhelming</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="w-full bg-white text-black py-4 rounded-xl text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border border-black/30 border-t-black rounded-full animate-spin" />
                Your future self is reflecting...
              </span>
            ) : (
              'Speak to my future self →'
            )}
          </button>

          <p className="text-center text-muted text-xs">
            {inputText.length}/2000 characters
          </p>
        </form>
      </div>
    </div>
  )
}