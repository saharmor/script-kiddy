import { useState } from 'react'
import { TranscriptionSettings, type TranscriptionModel } from '../components/TranscriptionSettings'
import { TranscriptionDropzone } from '../components/TranscriptionDropzone'
import { TranscriptionTable } from '../components/TranscriptionTable'
import { RecordingModal } from '../components/RecordingModal'
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
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [prompt, setPrompt] = useState<string>('')

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

  const handleRecordingComplete = async (audioBlob: Blob, fileName: string) => {
    try {
      // Convert webm to mp3 for better compatibility
      const formData = new FormData()
      formData.append('audio', audioBlob, `${fileName}.webm`)
      formData.append('filename', fileName)

      const response = await fetch('http://127.0.0.1:8000/api/save-recording', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save recording')
      }

      const data = await response.json()
      console.log('Recording saved:', data)

      // Create a File object from the blob to add to the files list
      const file = new File([audioBlob], data.filename, { type: 'audio/webm' })
      setFiles([file])
      
      // Initialize results for the recorded file
      setResults([{
        fileName: data.filename,
        transcript: null,
        status: 'pending'
      }])

    } catch (error) {
      console.error('Error handling recording:', error)
      alert('Failed to save recording. Please try again.')
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
        if (prompt) {
          formData.append('prompt', prompt)
        }

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
                prompt={prompt}
                onPromptChange={setPrompt}
              />
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500 text-sm">Choose an option</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowRecordingModal(true)}
                        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center justify-center space-x-2"
                        disabled={isTranscribing}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M19 10V12C19 16.4183 15.4183 20 11 20C6.58172 20 3 16.4183 3 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M12 20V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Record Audio</span>
                      </button>
                      <p className="text-xs text-gray-500">Record directly from your microphone</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-center">
                        <span className="text-gray-700 font-medium">Upload Files</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <TranscriptionDropzone onFilesDrop={handleFilesDrop} />
              </div>
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
      
      <RecordingModal
        isOpen={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </div>
  )
}                  

