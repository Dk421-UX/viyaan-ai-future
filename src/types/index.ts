export interface EntryData {
  id: string
  userId: string
  inputText: string
  generatedText: string
  intensityBefore: number
  intensityAfter: number | null
  createdAt: string
  
  persona?: any
  primaryEmotion?: any
  secondaryEmotion?: any
  detectedFear?: any
  thinkingPattern?: any
  growthDirection?: any
  nextStep?: any
  confidenceLevel?: number | null
  fearLevel?: number | null
  stressLevel?: number | null
  hopeLevel?: number | null
  goalsStruggles?: string | null
}
