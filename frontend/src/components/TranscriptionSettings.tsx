import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select.jsx'

export type TranscriptionModel = 'whisper' | 'assemblyai' | 'local-whisper'

interface TranscriptionSettingsProps {
  selectedModel: TranscriptionModel
  onModelChange: (model: TranscriptionModel) => void
}

export function TranscriptionSettings({ selectedModel, onModelChange }: TranscriptionSettingsProps) {
  return (
    <div className="w-full p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
      <h2 className="text-lg font-semibold mb-4 text-red-700">Transcription Settings</h2>
      <Select
        value={selectedModel}
        onValueChange={(value) => onModelChange(value as TranscriptionModel)}
      >
        <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
          <SelectValue placeholder="Select transcription model" />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="whisper">OpenAI Whisper</SelectItem>
          <SelectItem value="assemblyai">AssemblyAI</SelectItem>
          <SelectItem value="local-whisper">Local Whisper</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}  