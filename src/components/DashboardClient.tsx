'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EntryData } from '../types'

interface Props {
  entries: EntryData[]
  email: string
  dbError?: string | null
}

function intensityColor(v: number) {
  if (v <= 3) return 'text-green-400'
  if (v <= 6) return 'text-accent'
  return 'text-red-400'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
    <div className="space-y-1.5 text-[11px] text-white/70 leading-relaxed font-light">
      {parsed.fear && (
        <p className="font-semibold text-white">{parsed.fear}</p>
      )}
      {parsed.pattern && (
        <p className="font-semibold text-white">{parsed.pattern}</p>
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

export default function DashboardClient({ entries, email, dbError }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'timeline' | 'growth'>('timeline')
  const [expanded, setExpanded] = useState<string | null>(null)
  
  // Growth Summary State
  const [summaryRange, setSummaryRange] = useState<30 | 90 | 365>(30)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryResult, setSummaryResult] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState('')

  // --- STATS CALCULATIONS ---
  const streak = calculateStreak(entries)
  const dominantEmotion = getMostCommonEmotion(entries)
  const progressScore = calculateProgressScore(entries)
  
  const avgBefore = entries.length
    ? Math.round((entries.reduce((a, e) => a + e.intensityBefore, 0) / entries.length) * 10) / 10
    : null
  const withAfter = entries.filter(e => e.intensityAfter !== null)
  const avgAfter = withAfter.length
    ? Math.round(
        (withAfter.reduce((a, e) => a + (e.intensityAfter ?? 0), 0) / withAfter.length) * 10,
      ) / 10
    : null

  // Growth Trends
  const entriesWithV2 = entries.filter(e => e.confidenceLevel !== undefined && e.confidenceLevel !== null)
  const avgConfidence = entriesWithV2.length
    ? Math.round((entriesWithV2.reduce((a, e) => a + (e.confidenceLevel ?? 0), 0) / entriesWithV2.length) * 10) / 10
    : null
  const avgFear = entriesWithV2.length
    ? Math.round((entriesWithV2.reduce((a, e) => a + (e.fearLevel ?? 0), 0) / entriesWithV2.length) * 10) / 10
    : null
  const avgStress = entriesWithV2.length
    ? Math.round((entriesWithV2.reduce((a, e) => a + (e.stressLevel ?? 0), 0) / entriesWithV2.length) * 10) / 10
    : null
  const avgHope = entriesWithV2.length
    ? Math.round((entriesWithV2.reduce((a, e) => a + (e.hopeLevel ?? 0), 0) / entriesWithV2.length) * 10) / 10
    : null

  // Frequency
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(now.getDate() - 7)
  const entriesLast7Days = entries.filter(e => new Date(e.createdAt) >= sevenDaysAgo).length

  // Breakthrough memory highlight (reductions >= 2)
  const breakthroughs = entries.filter(e => e.intensityAfter !== null && (e.intensityBefore - e.intensityAfter!) >= 2)
  const memoryHighlight = breakthroughs.length ? breakthroughs[0] : null

  async function generateGrowthSummary() {
    setGeneratingSummary(true)
    setSummaryError('')
    setSummaryResult(null)
    try {
      const res = await fetch(`/api/growth-summary?range=${summaryRange}`)
      const data = await res.json()
      if (!data.success) {
        setSummaryError(data.error || 'Failed to generate growth summary.')
      } else {
        setSummaryResult(data.data.summaryText)
      }
    } catch {
      setSummaryError('A connection error occurred. Please try again.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  // Helper streak calculators
  function calculateStreak(entriesList: EntryData[]) {
    if (!entriesList.length) return 0
    const dates = entriesList.map(e => new Date(e.createdAt).toDateString())
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d))
    uniqueDates.sort((a, b) => b.getTime() - a.getTime())
    
    let currentStreak = 0
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstEntryDate = new Date(uniqueDates[0])
    firstEntryDate.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - firstEntryDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) {
      return 0
    }
    
    let expectedDate = firstEntryDate
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(uniqueDates[i])
      checkDate.setHours(0, 0, 0, 0)
      
      const expectedTime = expectedDate.getTime() - (i * 1000 * 60 * 60 * 24)
      if (checkDate.getTime() === expectedTime) {
        currentStreak++
      } else {
        break
      }
    }
    return currentStreak
  }

  function getMostCommonEmotion(entriesList: EntryData[]) {
    const counts: Record<string, number> = {}
    entriesList.forEach(e => {
      if (e.primaryEmotion) {
        const emotion = renderAIFieldShort(e.primaryEmotion)
        if (emotion && emotion !== 'None' && emotion !== 'Unknown') {
          counts[emotion] = (counts[emotion] || 0) + 1
        }
      }
    })
    let maxCount = 0
    let common = 'None'
    Object.entries(counts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        common = emotion
      }
    })
    return common
  }

  function calculateProgressScore(entriesList: EntryData[]) {
    if (!entriesList.length) return 50
    let score = 50
    entriesList.forEach(e => {
      score += 2
      if (e.intensityAfter !== null && e.intensityBefore > e.intensityAfter) {
        score += (e.intensityBefore - e.intensityAfter) * 3
      }
    })
    return Math.min(100, score)
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto space-y-8">
      {/* 🔮 Glassmorphic Navbar */}
      <div className="flex justify-between items-center bg-card/40 border border-border/60 rounded-2xl p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <img
            src="/viyaan-logo.png"
            alt="logo"
            className="w-10 h-10 rounded-xl"
            style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
          />
          <div>
            <p className="text-[10px] tracking-[0.3em] text-accent uppercase font-bold">Viyaan Future</p>
            <h1 className="text-lg font-light text-white leading-tight">Personal Growth OS</h1>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={() => router.push('/new-entry')}
            className="bg-white text-black hover:bg-accent hover:text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-accent/5 active:scale-[0.98]"
          >
            + Reflect
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="border border-border/80 text-white/80 hover:text-white text-xs px-4 py-2.5 rounded-xl transition-all bg-white/[0.02]"
          >
            Profile
          </button>
        </div>
      </div>

      {/* 🚀 SaaS KPIs Matrix Dashboard */}
      {entries.length > 0 && !dbError && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in">
          {/* Streak Flame */}
          <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Check-in Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light text-white">🔥 {streak}</span>
              <span className="text-[10px] text-muted">days consecutive</span>
            </div>
          </div>

          {/* Reflections count */}
          <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Reflections Logged</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light text-white">📖 {entries.length}</span>
              <span className="text-[10px] text-muted">total</span>
            </div>
          </div>

          {/* Dominant Emotion */}
          <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Dominant State</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-medium text-white truncate max-w-[120px]">{dominantEmotion}</span>
              <span className="text-[10px] text-muted">frequent</span>
            </div>
          </div>

          {/* Growth Level */}
          <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
            <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Resilience Index</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light text-white">⚡ {progressScore}</span>
              <span className="text-[10px] text-muted">/100 score</span>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 Memory Highlights Banner */}
      {memoryHighlight && activeTab === 'timeline' && !dbError && (
        <div className="bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-transparent border border-purple-900/30 rounded-2xl p-6 relative overflow-hidden animate-in">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-purple-500/5 blur-xl rounded-full" />
          <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Past Victory Highlight</h4>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            Remember this? On {formatDate(memoryHighlight.createdAt)}, you were facing high emotional intensity ({memoryHighlight.intensityBefore}/10). After reading the perspective of your future self, you processed the feeling down to {memoryHighlight.intensityAfter}/10. You possess the capacity to navigate today's situation similarly.
          </p>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-border/60 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all relative ${
            activeTab === 'timeline' ? 'text-white' : 'text-muted hover:text-white'
          }`}
        >
          Timeline
          {activeTab === 'timeline' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('growth')}
          className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all relative ${
            activeTab === 'growth' ? 'text-white' : 'text-muted hover:text-white'
          }`}
        >
          Growth Intelligence
          {activeTab === 'growth' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {dbError ? (
            <div className="text-center py-20 bg-card border border-red-950/40 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-400 text-sm mb-4 font-medium">{dbError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="border border-border text-white text-xs px-5 py-2.5 rounded-lg hover:border-accent hover:text-accent transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-24 bg-card/20 border border-border/40 rounded-2xl p-8">
              <p className="text-muted text-sm mb-2 font-medium">Your timeline is empty.</p>
              <p className="text-muted text-xs">Start your self-reflection by speaking to the person you are becoming.</p>
              <button
                type="button"
                onClick={() => router.push('/new-entry')}
                className="mt-6 border border-border text-white text-xs px-5 py-2.5 rounded-lg hover:border-accent hover:text-accent transition-all font-medium bg-white/[0.02]"
              >
                Initiate First Reflection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const shift = entry.intensityAfter !== null ? entry.intensityBefore - entry.intensityAfter : null
                const isOpen = expanded === entry.id
                const parsedEmotion = entry.primaryEmotion ? renderAIFieldShort(entry.primaryEmotion) : ''
                const parsedPersona = entry.persona ? renderAIFieldShort(entry.persona) : ''
                
                return (
                  <div
                    key={entry.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-black/20"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : entry.id)}
                      className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-card/70 transition-colors outline-none"
                    >
                      <div className="flex-1 mr-4 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-muted font-mono">{formatDate(entry.createdAt)}</span>
                          {parsedPersona && (
                            <span className="text-[9px] bg-border text-accent px-2.5 py-0.5 rounded-full font-medium">
                              {parsedPersona}
                            </span>
                          )}
                          {parsedEmotion && parsedEmotion !== 'None' && (
                            <span className="text-[9px] bg-black/40 text-white/70 px-2.5 py-0.5 rounded-full border border-border">
                              {parsedEmotion}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/90 line-clamp-1">{entry.inputText}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className={`text-sm font-light ${intensityColor(entry.intensityBefore)}`}>
                            {entry.intensityBefore}/10
                          </p>
                          {shift !== null && (
                            <p className={`text-[10px] ${shift > 0 ? 'text-green-400' : shift < 0 ? 'text-red-400' : 'text-muted'}`}>
                              {shift > 0 ? `↓${shift} lighter` : shift < 0 ? `↑${Math.abs(shift)} heavier` : '—'}
                            </p>
                          )}
                        </div>
                        <span className={`text-muted text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-border/40 pt-5 animate-in space-y-5">
                        {/* The Future Message Card */}
                        <div className="bg-black/20 p-5 rounded-xl border border-border/30">
                          <p className="text-[9px] text-accent uppercase tracking-widest mb-2 font-bold">Future Perspective</p>
                          <p className="text-white/85 text-sm leading-7" style={{ fontFamily: 'Georgia, serif' }}>
                            {entry.generatedText}
                          </p>
                        </div>

                        {/* V2 Analytics Tags */}
                        {(entry.detectedFear || entry.thinkingPattern) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/40">
                            {entry.detectedFear && renderAIFieldShort(entry.detectedFear) !== 'None' && (
                              <div className="bg-black/25 p-4 rounded-xl border border-border/30 space-y-2">
                                <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Decoded Fear</p>
                                {renderAIField(entry.detectedFear)}
                              </div>
                            )}
                            {entry.thinkingPattern && renderAIFieldShort(entry.thinkingPattern) !== 'None' && (
                              <div className="bg-black/25 p-4 rounded-xl border border-border/30 space-y-2">
                                <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Thinking Pattern</p>
                                {renderAIField(entry.thinkingPattern)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Growth Direction and Practical Action Step */}
                        {(entry.growthDirection || entry.nextStep) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/40">
                            {entry.growthDirection && (
                              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                                <p className="text-[9px] uppercase tracking-wider text-accent font-bold mb-1">Growth Direction</p>
                                <div className="text-xs text-white/90 leading-relaxed">{renderAIField(entry.growthDirection)}</div>
                              </div>
                            )}
                            {entry.nextStep && (
                              <div className="bg-white/[0.02] border border-border rounded-xl p-4">
                                <p className="text-[9px] uppercase tracking-wider text-muted font-bold mb-1">Practical Action Step</p>
                                <div className="text-xs text-white/90 leading-relaxed">{renderAIField(entry.nextStep)}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-6 pt-4 border-t border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted mb-0.5">Intensity before</p>
                            <p className={`font-semibold ${intensityColor(entry.intensityBefore)}`}>{entry.intensityBefore}/10</p>
                          </div>
                          {entry.intensityAfter !== null && (
                            <>
                              <div>
                                <p className="text-[10px] text-muted mb-0.5">Intensity after</p>
                                <p className={`font-semibold ${intensityColor(entry.intensityAfter)}`}>{entry.intensityAfter}/10</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted mb-0.5">Integration Shift</p>
                                <p className={`font-semibold ${shift && shift > 0 ? 'text-green-400' : shift && shift < 0 ? 'text-red-400' : 'text-muted'}`}>
                                  {shift && shift > 0 ? `${shift} levels lighter` : shift && shift < 0 ? `${Math.abs(shift)} levels heavier` : 'unchanged'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* GROWTH INTELLIGENCE TAB */}
      {activeTab === 'growth' && (
        <div className="space-y-8 animate-in">
          {/* Trend Analysis Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Growth Trend Diagnostics</h3>
            
            {entriesWithV2.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">
                Not enough reflections logged to display diagnostic indicators. Complete your next connection session to unlock growth tracking.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Confidence */}
                <div className="bg-black/20 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-white/90">Confidence Trend</span>
                    <span className="text-xs text-green-400 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-light text-white">{avgConfidence || '—'}</span>
                    <span className="text-[10px] text-muted">/10 average</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full animate-pulse" style={{ width: `${(avgConfidence ?? 0) * 10}%` }} />
                  </div>
                </div>

                {/* Stress */}
                <div className="bg-black/20 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-white/90">Stress & Overwhelm Trend</span>
                    <span className="text-xs text-red-400 font-medium">Monitored</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-light text-white">{avgStress || '—'}</span>
                    <span className="text-[10px] text-muted">/10 average</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1">
                    <div className="bg-red-400 h-1 rounded-full animate-pulse" style={{ width: `${(avgStress ?? 0) * 10}%` }} />
                  </div>
                </div>

                {/* Fear */}
                <div className="bg-black/20 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-white/90">Fear & Anxiety Trend</span>
                    <span className="text-xs text-orange-400 font-medium">Regulated</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-light text-white">{avgFear || '—'}</span>
                    <span className="text-[10px] text-muted">/10 average</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1">
                    <div className="bg-orange-400 h-1 rounded-full animate-pulse" style={{ width: `${(avgFear ?? 0) * 10}%` }} />
                  </div>
                </div>

                {/* Hope */}
                <div className="bg-black/20 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-white/90">Hope & Optimism Trend</span>
                    <span className="text-xs text-blue-400 font-medium">Grounded</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-light text-white">{avgHope || '—'}</span>
                    <span className="text-[10px] text-muted">/10 average</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1">
                    <div className="bg-blue-400 h-1 rounded-full animate-pulse" style={{ width: `${(avgHope ?? 0) * 10}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Reflection Frequency Footer */}
            <div className="mt-6 pt-5 border-t border-border/50 flex justify-between text-[11px] text-muted">
              <span>Timeline Activity</span>
              <span className="text-white font-medium">
                {entriesLast7Days} {entriesLast7Days === 1 ? 'reflection check-in' : 'reflection check-ins'} logged this week
              </span>
            </div>
          </div>

          {/* Growth Summary Generator */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-1">Growth summaries</h3>
              <p className="text-xs text-muted">Ask your future self to perform meta-analysis on all timeline logs across a timeframe.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                {([
                  { range: 30, label: '30 Days' },
                  { range: 90, label: '90 Days' },
                  { range: 365, label: '1 Year' }
                ] as const).map(r => (
                  <button
                    key={r.range}
                    type="button"
                    onClick={() => setSummaryRange(r.range)}
                    className={`flex-1 sm:flex-initial text-xs px-4 py-2.5 rounded-xl border font-semibold transition-all ${
                      summaryRange === r.range
                        ? 'border-accent bg-accent/5 text-accent font-semibold'
                        : 'border-border bg-black/20 text-muted hover:border-muted hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={generateGrowthSummary}
                disabled={generatingSummary || entries.length === 0}
                className="w-full sm:w-auto bg-white text-black px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-40"
              >
                {generatingSummary ? 'Processing timeline logs...' : 'Request Timeline Summary Reflection'}
              </button>
            </div>

            {/* Error messaging */}
            {summaryError && (
              <div className="bg-red-950/20 border border-red-900/35 rounded-xl px-4 py-3 text-red-400 text-xs">
                {summaryError}
              </div>
            )}

            {/* Premium Loading Skeleton */}
            {generatingSummary && (
              <div className="bg-black/20 border border-border/40 rounded-xl p-6 relative animate-pulse space-y-4">
                <div className="h-3 w-1/4 bg-white/10 rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 w-full bg-white/5 rounded" />
                  <div className="h-2.5 w-11/12 bg-white/5 rounded" />
                  <div className="h-2.5 w-10/12 bg-white/5 rounded" />
                  <div className="h-2.5 w-9/12 bg-white/5 rounded" />
                  <div className="h-2.5 w-11/12 bg-white/5 rounded" />
                </div>
              </div>
            )}

            {/* Result text */}
            {summaryResult && (
              <div className="bg-black/30 border border-border/80 rounded-xl p-6 relative animate-in space-y-4 shadow-inner">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">
                  A {summaryRange}-Day reflection letter from the person you are becoming:
                </p>
                <p className="text-white/90 leading-7 text-sm font-light whitespace-pre-line" style={{ fontFamily: 'Georgia, serif' }}>
                  {summaryResult}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
