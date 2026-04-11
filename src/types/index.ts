export interface EntryData {
  id: string
  userId: string
  inputText: string
  generatedText: string
  intensityBefore: number
  intensityAfter: number | null
  createdAt: string
}
