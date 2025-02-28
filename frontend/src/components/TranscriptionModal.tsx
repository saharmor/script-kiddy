import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{fileName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
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