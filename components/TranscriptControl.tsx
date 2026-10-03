import React, { useEffect, useState } from 'react';

import { formatTranscript, getTranscriptFileName, type TranscriptEntry } from '../transcript';
import { DownloadIcon, RecordIcon, StopIcon } from './Icons';
import ThemedButton from './ThemedButton';

const DOWNLOAD_REVEAL_DELAY_MS = 2000;

interface TranscriptControlProps {
  canRecord: boolean;
  isLastSlide: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  slides: { title?: string }[];
  transcript: TranscriptEntry[];
}

const downloadTranscript = (transcript: TranscriptEntry[], slides: { title?: string }[]) => {
  const url = URL.createObjectURL(new Blob([formatTranscript(transcript, slides)], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = getTranscriptFileName(new Date());
  link.click();
  URL.revokeObjectURL(url);
};

const TranscriptControl: React.FC<TranscriptControlProps> = ({
  canRecord,
  isLastSlide,
  isRecording,
  onToggleRecording,
  slides,
  transcript,
}) => {
  const [isDownloadRevealed, setIsDownloadRevealed] = useState(false);

  useEffect(() => {
    if (!isLastSlide) {
      setIsDownloadRevealed(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => setIsDownloadRevealed(true), DOWNLOAD_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [isLastSlide]);

  if (!isRecording && isLastSlide && isDownloadRevealed && transcript.length > 0) {
    return (
      <ThemedButton
        onClick={() => downloadTranscript(transcript, slides)}
        variant="primary"
        aria-label="Download transcript"
        title="Download transcript"
      >
        <DownloadIcon className="h-4 w-4" />
      </ThemedButton>
    );
  }

  if (!canRecord && !isRecording) return null;

  const label = isRecording ? 'Stop recording transcript' : 'Record transcript';

  return (
    <ThemedButton
      onClick={onToggleRecording}
      variant={isRecording ? 'primary' : 'secondary'}
      aria-pressed={isRecording}
      aria-label={label}
      title={label}
    >
      {isRecording ? <StopIcon className="h-4 w-4 motion-safe:animate-pulse" /> : <RecordIcon className="h-4 w-4 text-danger" />}
    </ThemedButton>
  );
};

export default TranscriptControl;
