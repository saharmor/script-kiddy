import { useState } from 'react'
import { TranscriptionSettings, type TranscriptionModel } from '../components/TranscriptionSettings'
import { TranscriptionDropzone } from '../components/TranscriptionDropzone'
import { TranscriptionTable } from '../components/TranscriptionTable'
import React from 'react'

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

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Update status to processing
      setResults(prev => prev.map((result, index) => 
        index === i ? { ...result, status: 'processing' } : result
      ))

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('model', selectedModel)

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Transcription failed')

        const data = await response.json()
        
        // Update results with transcript
        setResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            transcript: data.text,
            status: 'completed'
          } : result
        ))
      } catch (error) {
        setResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'error' } : result
        ))
      }
    }

    setIsTranscribing(false)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {!isTranscribing ? (
        <>
          <TranscriptionSettings 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <TranscriptionDropzone onFilesDrop={handleFilesDrop} />
          {files.length > 0 && (
            <button
              onClick={startTranscription}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Transcribing ({files.length} files)
            </button>
          )}
        </>
      ) : (
        <TranscriptionTable results={results} />
      )}
    </div>
  )
} 