import { useCallback, useEffect, useRef, useState } from 'react';

export interface FinalSpeechRecognitionResult {
  alternatives: Array<{ confidence: number; transcript: string }>;
  confidence: number;
  resultId: string;
  transcript: string;
}

interface UseSpeechRecognitionOptions {
  onFinalResult: (result: FinalSpeechRecognitionResult) => void;
}

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

const getVoiceErrorMessage = (error: string) => {
  switch (error) {
    case 'audio-capture': return 'No microphone was found for voice commands.';
    case 'network': return 'Voice recognition hit a network error.';
    case 'not-allowed':
    case 'service-not-allowed': return 'Microphone access was denied.';
    default: return 'Voice recognition stopped unexpectedly.';
  }
};

const getMicrophonePermissionErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'SecurityError': return 'Microphone access was denied.';
      case 'NotFoundError': return 'No microphone was found for voice commands.';
      case 'NotReadableError': return 'The microphone is busy in another application.';
      default: return error.message || 'Microphone access could not be started.';
    }
  }

  return error instanceof Error ? error.message : 'Microphone access could not be started.';
};

export const useSpeechRecognition = ({ onFinalResult }: UseSpeechRecognitionOptions) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  const shouldKeepListeningRef = useRef(false);
  const initialStartAttemptedRef = useRef(false);
  const sessionIdRef = useRef(0);
  const isVoiceSupported = getSpeechRecognition() !== null;
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  const setVoiceControlsEnabled = useCallback((shouldEnable: boolean) => {
    if (!isVoiceSupported) {
      setVoiceError('Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    shouldKeepListeningRef.current = shouldEnable;
    setIsVoiceEnabled(shouldEnable);
    setVoiceError(null);

    try {
      if (shouldEnable) {
        recognition.start();
        return;
      }

      recognition.stop();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'InvalidStateError') return;

      shouldKeepListeningRef.current = false;
      setIsVoiceEnabled(false);
      setVoiceError(error instanceof Error ? error.message : 'Voice recognition could not start.');
    }
  }, [isVoiceSupported]);

  const requestMicrophonePermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setVoiceControlsEnabled(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setVoiceControlsEnabled(true);
    } catch (error) {
      shouldKeepListeningRef.current = false;
      setIsVoiceEnabled(false);
      setVoiceError(getMicrophonePermissionErrorMessage(error));
    }
  }, [setVoiceControlsEnabled]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    sessionIdRef.current += 1;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setVoiceError(null);
      setIsVoiceListening(true);
    };

    recognition.onresult = event => {
      for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
        const result = event.results[resultIndex];
        if (!result.isFinal) continue;

        const alternatives = Array.from({ length: result.length }, (_, index) => ({
          confidence: result[index].confidence,
          transcript: result[index].transcript.trim(),
        })).filter(alternative => alternative.transcript);
        const primary = alternatives[0];
        if (!primary) continue;

        onFinalResultRef.current({
          alternatives,
          confidence: primary.confidence,
          resultId: `${sessionIdRef.current}:${resultIndex}`,
          transcript: primary.transcript,
        });
      }
    };

    recognition.onerror = event => {
      if ((event.error === 'aborted' && !shouldKeepListeningRef.current) || event.error === 'no-speech') return;

      shouldKeepListeningRef.current = false;
      setIsVoiceEnabled(false);
      setIsVoiceListening(false);
      setVoiceError(getVoiceErrorMessage(event.error));
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
      if (!shouldKeepListeningRef.current) {
        setIsVoiceEnabled(false);
        return;
      }

      try {
        recognition.start();
      } catch (error) {
        shouldKeepListeningRef.current = false;
        setIsVoiceEnabled(false);
        setVoiceError(error instanceof Error ? error.message : 'Voice recognition could not restart.');
      }
    };

    recognitionRef.current = recognition;
    if (!initialStartAttemptedRef.current) {
      const timeout = window.setTimeout(() => {
        if (recognitionRef.current === recognition && !initialStartAttemptedRef.current) {
          initialStartAttemptedRef.current = true;
          void requestMicrophonePermission();
        }
      }, 0);

      return () => {
        window.clearTimeout(timeout);
        shouldKeepListeningRef.current = false;
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
        recognitionRef.current = null;
      };
    }

    return () => {
      shouldKeepListeningRef.current = false;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [requestMicrophonePermission]);

  return {
    isVoiceEnabled,
    isVoiceListening,
    isVoiceSupported,
    requestMicrophonePermission,
    setVoiceControlsEnabled,
    voiceError,
  };
};
