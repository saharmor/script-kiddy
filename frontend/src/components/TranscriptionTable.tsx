import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { TranscriptionModal } from './TranscriptionModal'

interface Segment {
  text: string
  start: number
  end: number
}

interface TranscriptionResult {
  fileName: string
  transcript: string | null
  segments?: Segment[]
  status: 'pending' | 'processing' | 'completed' | 'error'
}

interface TranscriptionTableProps {
  results: TranscriptionResult[]
}


export function TranscriptionTable({ results }: TranscriptionTableProps) {
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptionResult | null>(null);
  
  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  return (
    <>
      <div className="w-full overflow-x-auto flex-grow flex text-left">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">File Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Transcript</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.fileName} className="border-b">
                <td className="p-4">{result.fileName}</td>
                
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full 
                    ${result.status === 'completed' ? 'bg-green-100 text-green-700' :
                      result.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      result.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'}`}>
                    {result.status}
                  </span>
                </td>

                <td className="p-4">
                  {result.transcript ? (
                    <div className="flex items-center gap-2">
                      <span>{truncateText(result.transcript)}</span>
                      <button
                      onClick={() => navigator.clipboard.writeText(result.transcript || '')}
                      className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Copy
                    </button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedTranscript(result)}
                      >
                        Show More
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>
                        {result.status === 'pending' ? 'Waiting...' :
                         result.status === 'processing' ? 'Transcribing...' :
                         result.status === 'error' ? 'Error occurred' : ''}
                      </span>
                      {result.status === 'processing' && (
                        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTranscript && (
        <TranscriptionModal
          isOpen={!!selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
          transcript={selectedTranscript.transcript || ''}
          fileName={selectedTranscript.fileName}
          segments={selectedTranscript.segments}
        />
      )}
    </>
  )
}  