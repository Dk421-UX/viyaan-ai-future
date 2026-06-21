'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PERSONAS = [
  { id: '1 Year Future Self', name: '1 Year Future Self', tag: 'Near Future', desc: 'Relates closely to today, but knows how it resolves.' },
  { id: '5 Year Future Self', name: '5 Year Future Self', tag: 'Turning Point', desc: 'Looking back at this era as a key transition.' },
  { id: '10 Year Future Self', name: '10 Year Future Self', tag: 'Distant Harbor', desc: 'A serene space. Today is a tiny ripple in a long life.' },
  { id: 'Future Self After Success', name: 'Success Self', tag: 'Achieved', desc: 'Reflects on the grit and details that built your goals.' },
  { id: 'Future Self After Healing', name: 'Healed Self', tag: 'Closure', desc: 'Speaks from a place of deep peace and self-compassion.' },
  { id: 'Future Self After Confidence', name: 'Confident Self', tag: 'Assured', desc: 'Bold, clear-eyed, and free from self-doubt.' },
  { id: 'Future Entrepreneur Self', name: 'Entrepreneur Self', tag: 'Pragmatic', desc: 'Action-oriented, focused on growth and execution.' },
  { id: 'Future Calm Self', name: 'Calm Self', tag: 'Anchor', desc: 'A steady, still presence amidst the chaos.' },
]

export default function NewEntryPage() {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [persona, setPersona] = useState('5 Year Future Self')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('Connecting to persona timeline...')

  useEffect(() => {
    if (!loading) return
    const messages = [
      'Establishing secure reflection path...',
      'Analyzing current emotional intensity metrics...',
      'Retrieving timeline memories...',
      'Deconstructing thinking patterns & cognitive safety loops...',
      'Formulating reflective growth advice...',
      'Generating future-perspective letter...',
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length
      setLoadingMessage(messages[idx])
    }, 1800)
    return () => clearInterval(interval)
  }, [loading])

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
        body: JSON.stringify({ 
          inputText: inputText.trim(), 
          intensityBefore: intensity,
          persona 
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Reflection failed.')
        setLoading(false)
        return
      }

      sessionStorage.setItem(
        'viyaan_entry',
        JSON.stringify({
          inputText: inputText.trim(),
          intensityBefore: intensity,
          persona,
          generatedText: data.data.generatedText,
          primaryEmotion: data.data.primaryEmotion,
          secondaryEmotion: data.data.secondaryEmotion,
          detectedFear: data.data.detectedFear,
          thinkingPattern: data.data.thinkingPattern,
          growthDirection: data.data.growthDirection,
          nextStep: data.data.nextStep,
          confidenceLevel: data.data.confidenceLevel,
          fearLevel: data.data.fearLevel,
          stressLevel: data.data.stressLevel,
          hopeLevel: data.data.hopeLevel,
          goalsStruggles: data.data.goalsStruggles,
        }),
      )
      router.push('/result')
    } catch {
      setError('Failed to generate reflection. Please try again.')
      setLoading(false)
    }
  }

  const intensityLabel = intensity <= 3 ? 'Low' : intensity <= 6 ? 'Moderate' : intensity <= 8 ? 'High' : 'Intense'
  const intensityColor = intensity <= 3 ? 'text-green-400' : intensity <= 6 ? 'text-accent' : 'text-red-400'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#080808] relative overflow-hidden text-white">
        {/* Glow effects */}
        <div className="absolute w-[500px] h-[500px] bg-accent/5 rounded-full filter blur-[80px] animate-pulse" />
        
        <div className="w-full max-w-md text-center space-y-8 relative z-10">
          {/* Pulsing temporal portal icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border border-accent/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full border-2 border-accent flex items-center justify-center bg-card shadow-[0_0_40px_rgba(139,92,246,0.15)]">
              <span className="text-2xl animate-pulse">🔮</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-light tracking-widest text-white uppercase">Syncing Timelines</h2>
            <p className="text-xs text-accent font-semibold tracking-wider font-mono animate-pulse min-h-[16px]">
              {loadingMessage}
            </p>
            <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
              Your future self is receiving the details of this moment and articulating their perspective.
            </p>
          </div>

          {/* Skeleton representation of the incoming letter */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden animate-pulse">
            <div className="h-3 w-1/3 bg-white/10 rounded" />
            <div className="space-y-2 pt-2">
              <div className="h-2 w-full bg-white/5 rounded" />
              <div className="h-2 w-11/12 bg-white/5 rounded" />
              <div className="h-2 w-10/12 bg-white/5 rounded" />
              <div className="h-2 w-9/12 bg-white/5 rounded" />
              <div className="h-2 w-11/12 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl animate-in">
        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-muted text-xs hover:text-white transition-colors mb-8 flex items-center gap-2"
          >
            ← Back to timeline
          </button>
          <p className="text-xs tracking-[0.25em] text-muted uppercase mb-3">Viyaan Future V2</p>
          <h1 className="text-3xl font-light tracking-tight">Speak to the person you are becoming.</h1>
          <p className="text-muted text-sm mt-2">Write honestly. No judgment, no filters.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-10">
          {/* Text Area */}
          <div className="space-y-2">
            <label className="text-xs tracking-wider uppercase text-muted">What is happening inside you?</label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Explain the setbacks, stress, fears, or successes you are feeling right now. Be honest..."
              rows={6}
              maxLength={2000}
              className="w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-white placeholder:text-muted focus:border-accent transition-colors leading-relaxed outline-none"
            />
            <p className="text-right text-muted text-[10px]">{inputText.length}/2000 characters</p>
          </div>

          {/* Persona Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-xs tracking-wider uppercase text-muted">Choose your Future Persona guide</label>
              <p className="text-xs text-muted mt-1">Select the timeline and lens you want to receive perspective from.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PERSONAS.map(p => {
                const active = persona === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                      active 
                        ? 'border-accent bg-accent/5 shadow-md shadow-accent/5' 
                        : 'border-border bg-card/60 hover:border-muted'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                        active ? 'bg-accent text-black font-semibold' : 'bg-border text-muted'
                      }`}>
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">{p.desc}</p>
                    {active && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-accent/10 rounded-bl-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Emotional Intensity Slider */}
          <div className="space-y-4 bg-card/40 border border-border/50 rounded-xl p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs tracking-wider uppercase text-muted">Emotional Intensity</p>
                <p className="text-[11px] text-muted">Rate the strength of this emotion right now.</p>
              </div>
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
              className="intensity-slider w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>Calm & Grounded</span>
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
            className="w-full bg-white text-black py-4 rounded-xl text-sm font-semibold hover:bg-accent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/5 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Retrieving memories & reflecting...
              </span>
            ) : (
              'Initiate connection to future self →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
