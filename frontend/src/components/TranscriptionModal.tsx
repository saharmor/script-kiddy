import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"

interface Segment {
  text: string
  start: number
  end: number
}

interface TranscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  transcript: string
  fileName: string
  segments?: Segment[]
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function TranscriptionModal({ isOpen, onClose, transcript, fileName, segments }: TranscriptionModalProps) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{fileName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Tooltip content={copied ? "Copied!" : "Copy entire transcript"}>
            <Button 
              onClick={handleCopy}
              variant="outline"
              size="icon"
              disabled={copied}
              className={`${copied 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}
            >
              {copied ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3C8 2.44772 7.55228 2 7 2H4C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H7C7.55228 14 8 13.5523 8 13V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 6C20 5.44772 19.5523 5 19 5H10C9.44772 5 9 5.44772 9 6V21C9 21.5523 9.44772 22 10 22H19C19.5523 22 20 21.5523 20 21V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </Button>
          </Tooltip>
        </div>
        <div className="mt-2">
          {segments && segments.length > 0 ? (
            <div>
              <h4 className="text-md font-semibold mb-3">Timestamped Segments</h4>
              <div className="space-y-2">
                {segments.map((segment, idx) => (
                  <p key={idx} className="text-sm">
                    <span className="text-gray-500">
                      [{formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}]
                    </span>
                    <span className="ml-2">{segment.text}</span>
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700">{transcript}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 