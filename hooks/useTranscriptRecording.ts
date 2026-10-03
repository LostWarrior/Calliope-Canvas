import { useCallback, useEffect, useRef, useState } from 'react';

import type { TranscriptEntry } from '../transcript';

interface UseTranscriptRecordingOptions {
  canRecord: boolean;
  currentSlideRef: React.RefObject<number>;
}

export const useTranscriptRecording = ({ canRecord, currentSlideRef }: UseTranscriptRecordingOptions) => {
  const [isRecording, setIsRecordingState] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const isRecordingRef = useRef(false);
  const canRecordRef = useRef(canRecord);

  const setRecording = useCallback((shouldRecord: boolean) => {
    const nextIsRecording = shouldRecord && canRecordRef.current;
    isRecordingRef.current = nextIsRecording;
    setIsRecordingState(nextIsRecording);
  }, []);

  const captureSpeech = useCallback((text: string) => {
    if (!isRecordingRef.current) return;

    setTranscript(entries => [
      ...entries,
      { slide: currentSlideRef.current ?? 0, text, timestamp: Date.now() },
    ]);
  }, [currentSlideRef]);

  useEffect(() => {
    canRecordRef.current = canRecord;
    if (!canRecord) setRecording(false);
  }, [canRecord, setRecording]);

  return { captureSpeech, isRecording, setRecording, transcript };
};
