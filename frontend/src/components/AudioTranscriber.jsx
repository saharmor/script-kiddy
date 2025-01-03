import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Upload, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AudioTranscriber = () => {
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setIsLoading(true);
      setError(null);
      
      try {
        const formData = new FormData();
        formData.append('audio', file);
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Transcription failed');
        
        const data = await response.json();
        setRecordings(prev => [...prev, {
          name: file.name,
          timestamp: new Date().toISOString(),
          transcription: data.transcription
        }]);
      } catch (err) {
        setError('Failed to transcribe audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        
        setIsLoading(true);
        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error('Transcription failed');
          
          const data = await response.json();
          setRecordings(prev => [...prev, {
            name: 'Recording ' + (prev.length + 1),
            timestamp: new Date().toISOString(),
            transcription: data.transcription
          }]);
        } catch (err) {
          setError('Failed to transcribe recording. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 30000);
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={startRecording} 
              disabled={isRecording || isLoading}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {isRecording ? 'Recording...' : 'Record Audio'}
            </Button>
            
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Audio
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Transcribing audio...
            </div>
          )}

          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{recording.name}</span>
                    <span>{new Date(recording.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{recording.transcription}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioTranscriber;