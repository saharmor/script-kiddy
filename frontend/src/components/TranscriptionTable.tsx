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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span>
                        {result.transcript.split(' ').slice(0, 100).join(' ')}
                        {result.transcript.split(' ').length > 100 && '...'}
                      </span>
                      {result.transcript.split(' ').length > 100 && (
                        <button
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-lg font-semibold">Full Transcript</h3>
                                  <button class="text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.parentElement.remove()">
                                    ✕
                                  </button>
                                </div>
                                <p class="text-gray-700 whitespace-pre-wrap">${result.transcript}</p>
                              </div>
                            `;
                            document.body.appendChild(modal);
                            modal.onclick = (e) => {
                              if (e.target === modal) modal.remove();
                            };
                          }}
                          className="px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                        >
                          Show More
                        </button>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(result.transcript || '')}
                        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Copy
                      </button>
                    </div>
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
  )
} 