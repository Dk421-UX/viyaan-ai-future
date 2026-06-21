'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EntryState {
  inputText: string
  intensityBefore: number
  generatedText: string
  persona: string
  primaryEmotion: any
  secondaryEmotion: any
  detectedFear: any
  thinkingPattern: any
  growthDirection: any
  nextStep: any
  confidenceLevel: number
  fearLevel: number
  stressLevel: number
  hopeLevel: number
  goalsStruggles: string
}

function parseIfJson(val: any) {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return val;
      }
    }
    return val;
  }
  return val;
}

function renderAIFieldShort(field: any, fallback = 'None') {
  const parsed = parseIfJson(field);
  if (!parsed) return fallback;
  if (typeof parsed === 'object') {
    return parsed.fear || parsed.pattern || parsed.translated || parsed.name || String(parsed);
  }
  return String(parsed);
}

function renderAIField(field: any) {
  const parsed = parseIfJson(field);
  if (!parsed) return null;

  if (typeof parsed === 'string') {
    return <span className="text-xs text-white/80 leading-relaxed font-light">{parsed}</span>;
  }

  if (typeof parsed !== 'object') {
    return <span className="text-xs text-white/80 leading-relaxed font-light">{String(parsed)}</span>;
  }

  // It's a structured object
  return (
    <div className="space-y-2 text-xs text-white/80 leading-relaxed font-light">
      {parsed.fear && (
        <p className="font-semibold text-white text-sm">{parsed.fear}</p>
      )}
      {parsed.pattern && (
        <p className="font-semibold text-white text-sm">{parsed.pattern}</p>
      )}
      {parsed.predicts && (
        <p>
          <strong className="text-accent/90 font-medium">What the fear predicts:</strong> {parsed.predicts}
        </p>
      )}
      {parsed.matteredLater && (
        <p>
          <strong className="text-accent/90 font-medium">What actually mattered later:</strong> {parsed.matteredLater}
        </p>
      )}
      {parsed.overlooking && (
        <p>
          <strong className="text-accent/90 font-medium">What you are overlooking:</strong> {parsed.overlooking}
        </p>
      )}
      {parsed.translated && (
        <p>
          <strong className="text-accent/90 font-medium">Meaning:</strong> {parsed.translated}
        </p>
      )}
      {Object.entries(parsed).map(([key, val]) => {
        if (['fear', 'pattern', 'predicts', 'matteredLater', 'overlooking', 'translated'].includes(key)) {
          return null;
        }
        return (
          <p key={key}>
            <strong className="text-accent/90 capitalize font-medium">{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
          </p>
        );
      })}
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter()
  const [entry, setEntry] = useState<EntryState | null>(null)
  const [intensityAfter, setIntensityAfter] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('viyaan_entry')
    if (!raw) {
      router.push('/new-entry')
      return
    }
    try {
      const parsed = JSON.parse(raw) as EntryState
      setEntry(parsed)
      // Default intensityAfter to a reasonable level based on before
      setIntensityAfter(Math.max(1, Math.round(parsed.intensityBefore - 2)))
    } catch {
      router.push('/new-entry')
    }
    setTimeout(() => setRevealed(true), 300)
  }, [router])

  async function handleSave() {
    if (!entry) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...entry,
        intensityAfter,
        detectedFear: typeof entry.detectedFear === 'object' ? JSON.stringify(entry.detectedFear) : entry.detectedFear,
        thinkingPattern: typeof entry.thinkingPattern === 'object' ? JSON.stringify(entry.thinkingPattern) : entry.thinkingPattern,
        growthDirection: typeof entry.growthDirection === 'object' ? JSON.stringify(entry.growthDirection) : entry.growthDirection,
        nextStep: typeof entry.nextStep === 'object' ? JSON.stringify(entry.nextStep) : entry.nextStep,
      }
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to save reflection.')
        setSaving(false)
        return
      }
      setSaved(true)
      sessionStorage.removeItem('viyaan_entry')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  if (!entry) return null

  const shift = entry.intensityBefore - intensityAfter
  const shiftColor = shift > 0 ? 'text-green-400' : shift < 0 ? 'text-red-400' : 'text-muted'
  const shiftLabel = shift > 0 ? `↓ ${shift} lighter` : shift < 0 ? `↑ ${Math.abs(shift)} heavier` : '— unchanged'

  // Helper for progress bar
  const MetricProgress = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-white font-medium">{value}/10</span>
      </div>
      <div className="w-full bg-border rounded-full h-1">
        <div className={`h-1 rounded-full ${colorClass}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )

  const primaryEmotionString = entry.primaryEmotion && typeof entry.primaryEmotion === 'object' 
    ? (entry.primaryEmotion.emotion || JSON.stringify(entry.primaryEmotion)) 
    : String(entry.primaryEmotion || '');

  const secondaryEmotionString = entry.secondaryEmotion && typeof entry.secondaryEmotion === 'object' 
    ? (entry.secondaryEmotion.emotion || JSON.stringify(entry.secondaryEmotion)) 
    : String(entry.secondaryEmotion || '');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div
        className={`w-full max-w-2xl transition-all duration-700 space-y-8 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-2">Viyaan Future V2</p>
          <h1 className="text-xl font-light text-muted">Perspective from your {entry.persona}</h1>
        </div>

        {/* ✉️ Letter Card */}
        <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <p className="text-white/95 leading-8 text-base font-light whitespace-pre-line" style={{ fontFamily: 'Georgia, serif' }}>
            {entry.generatedText}
          </p>
        </div>

        {/* 🧠 Growth Intelligence Panel */}
        <div className="bg-card/60 border border-border/80 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full px-6 py-4 flex justify-between items-center border-b border-border/50 hover:bg-card transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Growth Intelligence Breakdown</span>
            </div>
            <span className="text-muted text-xs">{showAnalysis ? 'Collapse ▴' : 'Expand ▾'}</span>
          </button>

          {showAnalysis && (
            <div className="p-6 space-y-6 animate-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emotions */}
                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-border/40">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Detected Emotions</h4>
                  <div className="flex gap-2 flex-wrap">
                    {primaryEmotionString && (
                      <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full font-medium">
                        Primary: {primaryEmotionString}
                      </span>
                    )}
                    {secondaryEmotionString && secondaryEmotionString !== primaryEmotionString && (
                      <span className="text-xs bg-border text-white/80 px-3 py-1 rounded-full border border-border">
                        Secondary: {secondaryEmotionString}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <MetricProgress label="Stress & Overwhelm" value={entry.stressLevel} colorClass="bg-red-400" />
                    <MetricProgress label="Fear & Anxiety" value={entry.fearLevel} colorClass="bg-orange-400" />
                    <MetricProgress label="Hope & Hopefulness" value={entry.hopeLevel} colorClass="bg-blue-400" />
                    <MetricProgress label="Confidence & Assurance" value={entry.confidenceLevel} colorClass="bg-green-400" />
                  </div>
                </div>

                {/* Cognitive Distortion Decoded */}
                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-border/40 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Thinking Pattern</h4>
                    <span className="inline-block text-xs bg-red-950/20 border border-red-900/30 text-red-400/90 px-3 py-1 rounded-lg mb-2">
                      {renderAIFieldShort(entry.thinkingPattern, 'Balanced Thinking')}
                    </span>
                    <div className="text-xs text-muted leading-relaxed">
                      {renderAIField(entry.thinkingPattern) || (
                        <p>Your thinking matches a balanced cognitive framework.</p>
                      )}
                    </div>
                  </div>

                  {entry.goalsStruggles && (
                    <div className="border-t border-border/40 pt-3">
                      <h5 className="text-[10px] font-bold text-muted uppercase mb-1">Tracked struggles & goals</h5>
                      <p className="text-xs text-white/70 italic line-clamp-2">"{entry.goalsStruggles}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Decoded Fear & Action Card */}
              {entry.detectedFear && renderAIFieldShort(entry.detectedFear) !== 'None' && (
                <div className="bg-black/20 p-4 rounded-xl border border-border/40">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Decoded Fear</h4>
                  {renderAIField(entry.detectedFear)}
                </div>
              )}

              {/* Path and next step */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">Growth Path</p>
                  <div className="text-xs text-white/90 leading-relaxed">{renderAIField(entry.growthDirection)}</div>
                </div>
                <div className="bg-white/[0.02] border border-border rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Practical Action Step</p>
                  <div className="text-xs text-white/90 leading-relaxed">{renderAIField(entry.nextStep)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 📊 Post Reflection Intensity Slider */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-white font-medium mb-1">How do you feel now?</p>
          <p className="text-xs text-muted mb-6">Take a breath. After reading this reflection, rate your emotional intensity.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Intensity After Reflection</span>
              <span className="text-sm text-white font-medium">{intensityAfter}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intensityAfter}
              onChange={e => setIntensityAfter(Number(e.target.value))}
              className="intensity-slider w-full cursor-pointer"
            />
          </div>
          {entry.intensityBefore !== intensityAfter && (
            <p className={`text-xs mt-3 ${shiftColor}`}>{shiftLabel} than before</p>
          )}
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {saved ? (
          <div className="text-center py-4 bg-green-950/20 border border-green-900/30 rounded-xl">
            <p className="text-green-400 text-sm font-medium">Saved to timeline. Returning to your dashboard...</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 border border-border text-muted py-3.5 rounded-xl text-sm hover:border-white hover:text-white transition-all duration-300"
            >
              Discard Entry
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-2 flex-grow bg-white text-black py-3.5 rounded-xl text-sm font-semibold hover:bg-accent transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-accent/5"
            >
              {saving ? 'Saving to timeline...' : 'Commit to Timeline →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
