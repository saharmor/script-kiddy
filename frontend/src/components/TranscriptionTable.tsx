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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

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
                        onClick={() => handleCopy(result.transcript || '', results.indexOf(result))}
                        disabled={copiedIndex === results.indexOf(result)}
                        className={`px-2 py-1 text-sm rounded flex items-center gap-1 ${copiedIndex === results.indexOf(result) 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        {copiedIndex === results.indexOf(result) ? (
                          <>
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 3C8 2.44772 7.55228 2 7 2H4C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H7C7.55228 14 8 13.5523 8 13V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M20 6C20 5.44772 19.5523 5 19 5H10C9.44772 5 9 5.44772 9 6V21C9 21.5523 9.44772 22 10 22H19C19.5523 22 20 21.5523 20 21V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Copy
                          </>
                        )}
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