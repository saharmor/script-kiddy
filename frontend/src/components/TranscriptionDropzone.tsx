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
      className={`w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the audio files here..."
            : "Drag 'n' drop audio files here, or click to select files"}
        </p>
      </div>
    </div>
  )
} 