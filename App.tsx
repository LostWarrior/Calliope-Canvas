import React, { useEffect, useRef, useState } from 'react';
import TitleSlide from './slides/TitleSlide';
import PlaceholderSlide from './slides/PlaceholderSlide';
import Footer from './components/Footer';
import type { SlideDefinition } from './types';


const slides: SlideDefinition[] = [
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

const SPEAKER_NOTES_CHANNEL = 'calliope-canvas-speaker-notes';
const SPEAKER_NOTES_QUERY_PARAM = 'speaker-notes';

type SpeakerNotesStateMessage = {
  currentSlide: number;
  type: 'speaker-notes-state';
};

type SpeakerNotesRequestMessage = {
  type: 'speaker-notes-request-state';
};

type SpeakerNotesSetSlideMessage = {
  currentSlide: number;
  type: 'speaker-notes-set-slide';
};

type SpeakerNotesMessage =
  | SpeakerNotesStateMessage
  | SpeakerNotesRequestMessage
  | SpeakerNotesSetSlideMessage;

const isSpeakerNotesRoute = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get(SPEAKER_NOTES_QUERY_PARAM) === '1';
};

const clampSlideIndex = (slideIndex: number) =>
  Math.min(slides.length - 1, Math.max(0, slideIndex));

const isSpeakerNotesMessage = (message: unknown): message is SpeakerNotesMessage => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const { type } = message as { type?: unknown };
  return (
    type === 'speaker-notes-state'
    || type === 'speaker-notes-request-state'
    || type === 'speaker-notes-set-slide'
  );
};

const postSpeakerNotesState = (
  channel: BroadcastChannel | null,
  currentSlide: number
) => {
  channel?.postMessage({
    currentSlide,
    type: 'speaker-notes-state',
  } satisfies SpeakerNotesStateMessage);
};

const postSpeakerNotesSlideChange = (
  channel: BroadcastChannel | null,
  currentSlide: number
) => {
  channel?.postMessage({
    currentSlide,
    type: 'speaker-notes-set-slide',
  } satisfies SpeakerNotesSetSlideMessage);
};

const getSlideNotes = (slide: SlideDefinition) =>
  slide.notes?.length ? slide.notes : ['No speaker notes for this slide.'];

const renderSpeakerNote = (note: React.ReactNode) => {
  if (typeof note !== 'string') {
    return note;
  }

  return note.split(/(\[[^\]]+\])/g).map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <em key={`${part}-${index}`} className="italic">
          {part}
        </em>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
};

const SpeakerNotesView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const speakerNotesChannelRef = useRef<BroadcastChannel | null>(null);
  const currentSlideDefinition = slides[currentSlide];
  const nextSlideDefinition = slides[currentSlide + 1];

  const goToSlide = (slideIndex: number) => {
    const nextSlide = clampSlideIndex(slideIndex);

    setCurrentSlide(nextSlide);
    postSpeakerNotesSlideChange(speakerNotesChannelRef.current, nextSlide);
  };

  const goToNext = () => {
    goToSlide(currentSlide + 1);
  };

  const goToPrev = () => {
    goToSlide(currentSlide - 1);
  };

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return undefined;
    }

    const channel = new BroadcastChannel(SPEAKER_NOTES_CHANNEL);
    speakerNotesChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isSpeakerNotesMessage(event.data) || event.data.type !== 'speaker-notes-state') {
        return;
      }

      setCurrentSlide(clampSlideIndex(event.data.currentSlide));
      setIsConnected(true);
    };

    channel.postMessage({ type: 'speaker-notes-request-state' } satisfies SpeakerNotesRequestMessage);

    return () => {
      channel.close();

      if (speakerNotesChannelRef.current === channel) {
        speakerNotesChannelRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 font-sans text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrev}
                disabled={currentSlide === 0}
                className="px-3 py-1.5 text-sm bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-slate-400 font-mono">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={goToNext}
                disabled={currentSlide === slides.length - 1}
                className="px-3 py-1.5 text-sm bg-sky-600 rounded-md text-white font-semibold hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
              {isConnected ? 'Connected to deck' : 'Waiting for deck'}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              Speaker Notes
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {currentSlideDefinition.title}
            </h1>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section className="rounded-lg border border-slate-800 bg-slate-900 px-7 py-6">
            <h2 className="text-xl font-semibold text-white">Notes</h2>
            <ul className="mt-5 space-y-4 text-xl leading-relaxed text-slate-200">
              {getSlideNotes(currentSlideDefinition).map((note, index) => (
                <li key={index}>{renderSpeakerNote(note)}</li>
              ))}
            </ul>
          </section>

          <aside className="flex flex-col gap-4">

            <div className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Next
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-100">
                {nextSlideDefinition ? nextSlideDefinition.title : 'End of deck'}
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};


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

const DeckView: React.FC = () => {
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
        setCurrentSlide(clampSlideIndex(event.data.currentSlide));
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
            {slides[currentSlide].content}
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
        openSpeakerNotesView={openSpeakerNotesView}
        slideCount={slides.length}
        toggleFullscreen={toggleFullscreen}
        voiceError={voiceError}
      />
    </div>
  );
};

const App: React.FC = () => (isSpeakerNotesRoute() ? <SpeakerNotesView /> : <DeckView />);

export default App;
