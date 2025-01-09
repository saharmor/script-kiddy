import { useState } from 'react'
import { TranscriptionSettings, type TranscriptionModel } from '../components/TranscriptionSettings'
import { TranscriptionDropzone } from '../components/TranscriptionDropzone'
import { TranscriptionTable } from '../components/TranscriptionTable'
import React from 'react'
import '../index.css'

type TranscriptionResult = {
  fileName: string
  transcript: string | null
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<TranscriptionModel>('whisper')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<TranscriptionResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleFilesDrop = (newFiles: File[]) => {
    if (!isTranscribing) {
      setFiles(newFiles)
      // Initialize results for new files
      setResults(newFiles.map(file => ({
        fileName: file.name,
        transcript: null,
        status: 'pending'
      })))
    }
  }

  const startTranscription = async () => {
    setIsTranscribing(true)
    setShowResults(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Update status to processing
      setResults(prev => prev.map((result, index) => 
        index === i ? { ...result, status: 'processing' } : result
      ))

      try {
        const formData = new FormData()
        formData.append('audio', file)
        formData.append('model', selectedModel)

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Transcription failed')
        }

        const data = await response.json()
        console.log('Transcription result:', data)
        
        // Update results with transcript
        setResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            transcript: data.text,
            status: 'completed'
          } : result
        ))
      } catch (error) {
        console.error('Transcription error:', error)
        setResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'error' } : result
        ))
      }
    }

    setIsTranscribing(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-start justify-start">
      <div className="flex-grow flex flex-col mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Transcription Playground</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {!showResults ? (
            <>
              <TranscriptionSettings 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              <TranscriptionDropzone onFilesDrop={handleFilesDrop} />
              {files.length > 0 && (
                <button
                  onClick={startTranscription}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                >
                  Start Transcribing ({files.length} {files.length === 1 ? 'file' : 'files'})
                </button>
              )}
            </>
          ) : (
            <>
              <TranscriptionTable results={results} />
            </>
          )}
        </div>
      </div>
    </div>
  )
} 