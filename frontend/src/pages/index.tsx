import { useState } from 'react'
import { TranscriptionSettings, type TranscriptionModel } from '../components/TranscriptionSettings'
import { TranscriptionDropzone } from '../components/TranscriptionDropzone'
import { TranscriptionTable } from '../components/TranscriptionTable'
import React from 'react'
import '../index.css'

type Segment = {
  text: string
  start: number
  end: number
}

type TranscriptionResult = {
  fileName: string
  transcript: string | null
  segments?: Segment[]
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

  const resetTranscriptionState = () => {
    setShowResults(false);
    setFiles([]);
    setResults([]);
    setIsTranscribing(false)
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

        const response = await fetch('http://127.0.0.1:8000/api/transcribe', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Transcription failed')
        }

        const data = await response.json()
        console.log('Transcription result:', data)
        
        // Update results with transcript and segments
        setResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            transcript: data.text,
            segments: data.segments || [],
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
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-3xl mx-auto pt-20 px-4">
        <h1 className="text-3xl font-bold text-center mb-2 text-red-800">EchoScribe</h1>
        <p className="text-blue-700 mb-8">Transcribe recordings and generate insights locally or via a third-party API</p>
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
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  Start Transcribing ({files.length} {files.length === 1 ? 'file' : 'files'})
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-800">Transcription {isTranscribing ? 'Progress' : 'Results'}</h2>
                <button
                  onClick={resetTranscriptionState}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 20V15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 7.5C18.2239 9.22386 18.2239 11.8358 16.5 13.5597C14.7761 15.2836 12.1642 15.2836 10.4403 13.5597C8.71644 11.8358 8.71644 9.22386 10.4403 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  New Transcription
                </button>
              </div>
              <TranscriptionTable results={results} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}                  

