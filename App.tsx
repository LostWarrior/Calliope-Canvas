import React, { useEffect, useRef, useState } from 'react';
import TitleSlide from './slides/TitleSlide';
import Footer from './components/Footer';

const slides = [
  <TitleSlide />,
];

let hasAttemptedInitialVoiceStart = false;

const MIN_ZOOM_LEVEL = 0.8;
const MAX_ZOOM_LEVEL = 1.4;
const ZOOM_STEP = 0.1;

type VoiceAction =
  | 'next'
  | 'previous'
  | 'startAnimation'
  | 'stopAnimation'
  | 'zoomIn'
  | 'zoomOut';

const VOICE_COMMANDS: Array<{
  action: VoiceAction;
  label: string;
  phrases: string[];
}> = [
  { action: 'next', label: 'Next Slide', phrases: ['next slide please', 'next slide'] },
  {
    action: 'previous',
    label: 'Previous Slide',
    phrases: ['previous slide please', 'previous slide', 'lets go back', 'go back'],
  },
  { action: 'startAnimation', label: 'Start Animation', phrases: ['start animation'] },
  { action: 'stopAnimation', label: 'Stop Animation', phrases: ['stop animation'] },
  { action: 'zoomOut', label: 'Zoom Out', phrases: ['zoom out'] },
  { action: 'zoomIn', label: 'Zoom In', phrases: ['zoom in'] },
];

const normalizeTranscript = (transcript: string) =>
  transcript
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const clampZoomLevel = (zoomLevel: number) =>
  Number(Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, zoomLevel)).toFixed(2));

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

const getVoiceErrorMessage = (error: string) => {
  switch (error) {
    case 'audio-capture':
      return 'No microphone was found for voice commands.';
    case 'network':
      return 'Voice recognition hit a network error.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied.';
    default:
      return 'Voice recognition stopped unexpectedly.';
  }
};

const getMicrophonePermissionErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Microphone access was denied.';
      case 'NotFoundError':
        return 'No microphone was found for voice commands.';
      case 'NotReadableError':
        return 'The microphone is busy in another application.';
      default:
        return error.message || 'Microphone access could not be started.';
    }
  }

  return error instanceof Error ? error.message : 'Microphone access could not be started.';
};

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const isVoiceSupported = getSpeechRecognition() !== null;

  const commandHandlersRef = useRef({
    next: () => undefined,
    previous: () => undefined,
    startAnimation: () => undefined,
    stopAnimation: () => undefined,
    zoomIn: () => undefined,
    zoomOut: () => undefined,
  });

  const goToNext = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };

  const goToPrev = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const zoomIn = () => {
    setZoomLevel(prev => clampZoomLevel(prev + ZOOM_STEP));
  };

  const zoomOut = () => {
    setZoomLevel(prev => clampZoomLevel(prev - ZOOM_STEP));
  };

  const startAnimations = () => {
    setAnimationsPaused(false);
  };

  const stopAnimations = () => {
    setAnimationsPaused(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  commandHandlersRef.current = {
    next: goToNext,
    previous: goToPrev,
    startAnimation: startAnimations,
    stopAnimation: stopAnimations,
    zoomIn,
    zoomOut,
  };

  const setVoiceControlsEnabled = (shouldEnable: boolean) => {
    if (!isVoiceSupported) {
      setVoiceError('Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

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
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        return;
      }

      shouldKeepListeningRef.current = false;
      setIsVoiceEnabled(false);
      setVoiceError(error instanceof Error ? error.message : 'Voice recognition could not start.');
    }
  };

  const requestMicrophonePermission = async () => {
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
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === ' ') {
        if (animationsPaused) {
          startAnimations();
        } else {
          stopAnimations();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        if (shouldKeepListeningRef.current) {
          setVoiceControlsEnabled(false);
        } else {
          void requestMicrophonePermission();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationsPaused]);

  useEffect(() => {
    if (!isVoiceSupported) {
      return undefined;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setVoiceError(null);
      setIsVoiceListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
        const result = event.results[resultIndex];
        if (!result.isFinal) {
          continue;
        }

        const transcripts = Array.from({ length: result.length }, (_, index) => result[index].transcript);
        const primaryTranscript = transcripts[0]?.trim();
        if (primaryTranscript) {
          setLastHeard(primaryTranscript);
        }

        const matchedCommand = transcripts
          .map(transcript => normalizeTranscript(transcript))
          .map(normalizedTranscript =>
            VOICE_COMMANDS.find(command =>
              command.phrases.some(phrase => phrase === normalizedTranscript)
            )
          )
          .find(Boolean);

        if (!matchedCommand) {
          continue;
        }

        setLastCommand(matchedCommand.label);
        commandHandlersRef.current[matchedCommand.action]();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' && !shouldKeepListeningRef.current) {
        return;
      }

      if (event.error === 'no-speech') {
        return;
      }

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
        setVoiceError(
          error instanceof Error ? error.message : 'Voice recognition could not restart.'
        );
      }
    };

    recognitionRef.current = recognition;

    if (!hasAttemptedInitialVoiceStart) {
      const initialVoiceStartTimeout = window.setTimeout(() => {
        if (recognitionRef.current === recognition && !hasAttemptedInitialVoiceStart) {
          hasAttemptedInitialVoiceStart = true;
          void requestMicrophonePermission();
        }
      }, 0);

      return () => {
        window.clearTimeout(initialVoiceStartTimeout);
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
  }, [isVoiceSupported]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <main className="relative z-0 w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
        <div
          className={`presentation-stage w-full ${animationsPaused ? 'animations-paused' : ''}`}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="slide-container w-full">
            {slides[currentSlide]}
          </div>
        </div>
      </main>
      <Footer
        currentSlide={currentSlide}
        goToNext={goToNext}
        goToPrev={goToPrev}
        isFullscreen={isFullscreen}
        isVoiceEnabled={isVoiceEnabled}
        isVoiceListening={isVoiceListening}
        isVoiceSupported={isVoiceSupported}
        lastCommand={lastCommand}
        lastHeard={lastHeard}
        slides={slides}
        toggleFullscreen={toggleFullscreen}
        voiceError={voiceError}
      />
    </div>
  );
};

export default App;
