import React, { useEffect, useRef, useState } from 'react';

import Footer from './components/Footer';
import type { SlideDefinition, VoiceAction } from './types';
import { isSpeakerNotesRoute, SpeakerNotesView, SPEAKER_NOTES_QUERY_PARAM, SPEAKER_NOTES_CHANNEL, postSpeakerNotesState, isSpeakerNotesMessage } from './SpeakerNotes';
import HelpOverlay from './components/HelpOverlay';
import { VOICE_COMMANDS, getHelpShortcutSections, getSlideTransitionClass, isPresentationShortcutAllowed } from './presentationBehavior';
import TitleSlide from './slides/TitleSlide';
import PlaceholderSlide from './slides/PlaceholderSlide';


export const slides: SlideDefinition[] = [
  {
    content: <TitleSlide />,
    notes: [
      'Hello, everyone.',
      '[Welcome the audience and introduce the deck.]',
      '[Set expectations for what this presentation will cover.]',
    ],
    title: 'Calliope Canvas',
  },
  {
    content: <PlaceholderSlide />,
    notes: [
      'Replace this placeholder with the next slide in your presentation.',
      'Speaker notes can contain reminders, transitions, or extra context.',
    ],
    title: 'Add your slide here',
  },
];

const MIN_ZOOM_LEVEL = 0.8;
const MAX_ZOOM_LEVEL = 1.4;
const ZOOM_STEP = 0.1;

export const clampSlideIndex = (slideIndex: number) =>
  Math.min(slides.length - 1, Math.max(0, slideIndex));

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

const DeckView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFooterHidden, setIsFooterHidden] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentSlideRef = useRef(currentSlide);
  const speakerNotesChannelRef = useRef<BroadcastChannel | null>(null);
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

  const hasAttemptedInitialVoiceStartRef = useRef(false);
  const helpSections = getHelpShortcutSections();

  const goToNext = () => {
    setSlideDirection(1);
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };

  const goToPrev = () => {
    setSlideDirection(-1);
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const goToSlide = (nextSlide: number) => {
    const clampedSlide = clampSlideIndex(nextSlide);
    const currentSlideValue = currentSlideRef.current;

    if (clampedSlide !== currentSlideValue) {
      setSlideDirection(clampedSlide > currentSlideValue ? 1 : -1);
    }

    setCurrentSlide(clampedSlide);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
  };

  const toggleHelp = () => {
    setIsHelpOpen(prev => !prev);
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

  const openSpeakerNotesView = () => {
    const speakerNotesUrl = new URL(window.location.href);
    speakerNotesUrl.searchParams.set(SPEAKER_NOTES_QUERY_PARAM, '1');

    const speakerNotesWindow = window.open(
      speakerNotesUrl.toString(),
      'calliope-speaker-notes',
      'popup,width=1000,height=760'
    );

    speakerNotesWindow?.focus();

    window.setTimeout(() => {
      postSpeakerNotesState(speakerNotesChannelRef.current, currentSlideRef.current);
    }, 100);
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

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return undefined;
    }

    const channel = new BroadcastChannel(SPEAKER_NOTES_CHANNEL);
    speakerNotesChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isSpeakerNotesMessage(event.data)) {
        return;
      }

      if (event.data.type === 'speaker-notes-request-state') {
        postSpeakerNotesState(channel, currentSlideRef.current);
        return;
      }

      if (event.data.type === 'speaker-notes-set-slide') {
        goToSlide(event.data.currentSlide);
      }
    };

    postSpeakerNotesState(channel, currentSlideRef.current);

    return () => {
      channel.close();

      if (speakerNotesChannelRef.current === channel) {
        speakerNotesChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
    postSpeakerNotesState(speakerNotesChannelRef.current, currentSlide);
  }, [currentSlide]);

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
      if (isHelpOpen && !isPresentationShortcutAllowed(e.key, true)) {
        e.preventDefault();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        toggleHelp();
        return;
      }

      if (e.key === 'Escape' && isHelpOpen) {
        e.preventDefault();
        closeHelp();
        return;
      }

      if (isHelpOpen) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsFooterHidden(prev => !prev);
      } else if (e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (animationsPaused) {
          startAnimations();
        } else {
          stopAnimations();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (shouldKeepListeningRef.current) {
          setVoiceControlsEnabled(false);
        } else {
          void requestMicrophonePermission();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationsPaused, isHelpOpen]);

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

    if (!hasAttemptedInitialVoiceStartRef.current) {
      const initialVoiceStartTimeout = window.setTimeout(() => {
        if (recognitionRef.current === recognition && !hasAttemptedInitialVoiceStartRef.current) {
          hasAttemptedInitialVoiceStartRef.current = true;
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 font-sans relative">
      <div className="progress-bar w-full" style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}></div>
      <main className="relative z-0 w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
        <div
          className={`presentation-stage w-full ${animationsPaused ? 'animations-paused' : ''}`}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="slide-container w-full">
            <div key={currentSlide} className={getSlideTransitionClass(slideDirection)}>
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
      </main>
      <Footer
        currentSlide={currentSlide}
        goToNext={goToNext}
        goToPrev={goToPrev}
        isControlsHidden={isFooterHidden}
        isFullscreen={isFullscreen}
        isVoiceEnabled={isVoiceEnabled}
        isVoiceListening={isVoiceListening}
        isVoiceSupported={isVoiceSupported}
        lastCommand={lastCommand}
        lastHeard={lastHeard}
        openSpeakerNotesView={openSpeakerNotesView}
        slideCount={slides.length}
        toggleFullscreen={toggleFullscreen}
        voiceError={voiceError}
      />
      <HelpOverlay isOpen={isHelpOpen} onClose={closeHelp} sections={helpSections} />
    </div>
  );
};

const App: React.FC = () => (isSpeakerNotesRoute() ? <SpeakerNotesView /> : <DeckView />);

export default App;
