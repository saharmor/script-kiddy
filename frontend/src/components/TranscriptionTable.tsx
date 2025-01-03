import React from 'react'

interface TranscriptionResult {
  fileName: string
  transcript: string | null
  status: 'pending' | 'processing' | 'completed' | 'error'
}

interface TranscriptionTableProps {
  results: TranscriptionResult[]
}

export function TranscriptionTable({ results }: TranscriptionTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">File Name</th>
            <th className="p-4 text-left">Transcript</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.fileName} className="border-b">
              <td className="p-4">{result.fileName}</td>
              <td className="p-4">
                {result.transcript || 
                  <span className="text-gray-400">
                    {result.status === 'pending' ? 'Waiting...' :
                     result.status === 'processing' ? 'Transcribing...' :
                     result.status === 'error' ? 'Error occurred' : ''}
                  </span>
                }
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-sm
                  ${result.status === 'completed' ? 'bg-green-100 text-green-800' :
                    result.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {result.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 