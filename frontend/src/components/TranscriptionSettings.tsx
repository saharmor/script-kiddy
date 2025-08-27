import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select.jsx'
const SelectTriggerAny = SelectTrigger as unknown as React.ComponentType<any>
const SelectValueAny = SelectValue as unknown as React.ComponentType<any>
const SelectContentAny = SelectContent as unknown as React.ComponentType<any>
const SelectItemAny = SelectItem as unknown as React.ComponentType<any>

export type TranscriptionModel = 'whisper' | 'assemblyai' | 'local-whisper'

interface TranscriptionSettingsProps {
  selectedModel: TranscriptionModel
  onModelChange: (model: TranscriptionModel) => void
  prompt: string
  onPromptChange: (prompt: string) => void
}

export function TranscriptionSettings({ selectedModel, onModelChange, prompt, onPromptChange }: TranscriptionSettingsProps) {
  return (
    <div className="w-full p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
      <h2 className="text-lg font-semibold mb-4 text-red-700">Transcription Settings</h2>
      <Select
        value={selectedModel}
        onValueChange={(value) => onModelChange(value as TranscriptionModel)}
      >
        <SelectTriggerAny className="w-full border-blue-200 focus:border-blue-400">
          <SelectValueAny placeholder="Select transcription model" />
        </SelectTriggerAny>
        <SelectContentAny className="w-full">
          <SelectItemAny value="whisper">OpenAI Whisper</SelectItemAny>
          <SelectItemAny value="assemblyai">AssemblyAI</SelectItemAny>
          <SelectItemAny value="local-whisper">Local Whisper</SelectItemAny>
        </SelectContentAny>
      </Select>
      <div className="mt-4">
        <label className="block text-sm font-medium text-blue-800 mb-1">Prompt (optional)</label>
        <textarea
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onPromptChange(e.target.value)}
          placeholder="Provide optional context or instructions for the transcription..."
          className="w-full p-2 rounded-md border border-blue-200 focus:border-blue-400 focus:outline-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">This text is sent to the model as a prompt to guide transcription style or context.</p>
      </div>
    </div>
  )
}  