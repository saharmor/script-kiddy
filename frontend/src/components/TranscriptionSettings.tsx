import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select.jsx'

export type TranscriptionModel = 'whisper' | 'assemblyai'

interface TranscriptionSettingsProps {
  selectedModel: TranscriptionModel
  onModelChange: (model: TranscriptionModel) => void
}

export function TranscriptionSettings({ selectedModel, onModelChange }: TranscriptionSettingsProps) {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Transcription Settings</h2>
      <Select
        value={selectedModel}
        onValueChange={(value) => onModelChange(value as TranscriptionModel)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select transcription model" />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="whisper">OpenAI Whisper</SelectItem>
          <SelectItem value="assemblyai">AssemblyAI</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 