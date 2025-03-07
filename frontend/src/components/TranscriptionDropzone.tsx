import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface TranscriptionDropzoneProps {
  onFilesDrop: (files: File[]) => void
}

export function TranscriptionDropzone({ onFilesDrop }: TranscriptionDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles)
  }, [onFilesDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.m4a', '.wav']
    }
  })

  return (
    <div 
      {...getRootProps()} 
      className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
        ${isDragActive ? 'border-red-500 bg-red-50' : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'}`}
    >
      <input {...getInputProps()} />
      <div className="text-center space-y-2">
        <svg 
          className={`w-12 h-12 mx-auto ${isDragActive ? 'text-red-500' : 'text-blue-400'}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        <p className={`text-lg ${isDragActive ? 'text-red-600' : 'text-blue-600'}`}>
          {isDragActive ? "Drop the files here..." : "Drag & drop audio files here"}
        </p>
        <p className="text-sm text-blue-500">
          or click to select files
        </p>
        <p className="text-xs text-blue-400 mt-2">
          Supported formats: MP3, WAV, M4A
        </p>
      </div>
    </div>
  )
} 