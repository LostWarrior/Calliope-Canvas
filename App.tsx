import React, { useEffect, useRef, useState } from 'react';

import Footer from './components/Footer';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import type { SlideDefinition, VoiceAction } from './types';
import { isSpeakerNotesRoute, SpeakerNotesView, SPEAKER_NOTES_QUERY_PARAM, SPEAKER_NOTES_CHANNEL, postSpeakerNotesState, isSpeakerNotesMessage } from './SpeakerNotes';
import HelpOverlay from './components/HelpOverlay';
import { getHelpShortcutSections, getSlideTransitionClass, isPresentationShortcutAllowed } from './presentationBehavior';
import { useSpeechRecognition, type FinalSpeechRecognitionResult } from './hooks/useSpeechRecognition';
import { useSpeechFollow } from './hooks/useSpeechFollow';
import TitleSlide from './slides/TitleSlide';
import PlaceholderSlide from './slides/PlaceholderSlide';
import { isThemeName } from './theme';


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
    speech: {
      cues: ['add your slide here', 'placeholder slide', 'next section'],
    },
    title: 'Add your slide here',
  },
];

const MIN_ZOOM_LEVEL = 0.8;
const MAX_ZOOM_LEVEL = 1.4;
const ZOOM_STEP = 0.1;

export const clampSlideIndex = (slideIndex: number) =>
  Math.min(slides.length - 1, Math.max(0, slideIndex));

const clampZoomLevel = (zoomLevel: number) =>
  Number(Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, zoomLevel)).toFixed(2));

const DeckView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFooterHidden, setIsFooterHidden] = useState(false);
  const { setTheme, theme } = useTheme();

  const currentSlideRef = useRef(currentSlide);
  const themeRef = useRef(theme);
  const speakerNotesChannelRef = useRef<BroadcastChannel | null>(null);
  const speechFollowResultHandlerRef = useRef<(result: FinalSpeechRecognitionResult) => void>(() => undefined);
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
      postSpeakerNotesState(speakerNotesChannelRef.current, currentSlideRef.current, theme);
    }, 100);
  };

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
        postSpeakerNotesState(channel, currentSlideRef.current, themeRef.current);
        return;
      }

      if (event.data.type === 'speaker-notes-set-slide') {
        goToSlide(event.data.currentSlide);
        return;
      }

      if (event.data.type === 'speaker-notes-set-theme' && isThemeName(event.data.theme)) {
        setTheme(event.data.theme);
      }
    };

    postSpeakerNotesState(channel, currentSlideRef.current, themeRef.current);

    return () => {
      channel.close();

      if (speakerNotesChannelRef.current === channel) {
        speakerNotesChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
    themeRef.current = theme;
    postSpeakerNotesState(speakerNotesChannelRef.current, currentSlide, theme);
  }, [currentSlide, theme]);

  const commandHandlers: Record<VoiceAction, () => void> = {
    next: goToNext,
    previous: goToPrev,
    startAnimation: startAnimations,
    stopAnimation: stopAnimations,
    zoomIn,
    zoomOut,
  };

  const {
    isVoiceEnabled,
    isVoiceListening,
    isVoiceSupported,
    requestMicrophonePermission,
    setVoiceControlsEnabled,
    voiceError,
  } = useSpeechRecognition({
    onFinalResult: result => speechFollowResultHandlerRef.current(result),
  });
  const {
    canUndoAutoAdvance,
    isSpeechFollowEnabled,
    lastAutoAdvance,
    lastCommand,
    lastHeard,
    onFinalRecognitionResult,
    setIsSpeechFollowEnabled,
    undoAutoAdvance,
  } = useSpeechFollow({
    commandHandlers,
    currentSlide,
    isMatchingBlocked: isHelpOpen,
    isRecognitionAvailable: isVoiceEnabled,
    onGoToSlide: goToSlide,
    slides,
  });
  speechFollowResultHandlerRef.current = onFinalRecognitionResult;

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
        if (isVoiceEnabled) {
          setVoiceControlsEnabled(false);
        } else {
          void requestMicrophonePermission();
        }
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        undoAutoAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationsPaused, isHelpOpen, isVoiceEnabled, requestMicrophonePermission, setVoiceControlsEnabled, undoAutoAdvance]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-canvas font-sans text-text relative">
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
        isVoiceEnabled={isVoiceEnabled}
        isVoiceListening={isVoiceListening}
        isVoiceSupported={isVoiceSupported}
        isSpeechFollowEnabled={isSpeechFollowEnabled}
        canUndoAutoAdvance={canUndoAutoAdvance}
        lastAutoAdvance={lastAutoAdvance}
        lastCommand={lastCommand}
        lastHeard={lastHeard}
        openSpeakerNotesView={openSpeakerNotesView}
        slideCount={slides.length}
        toggleFullscreen={toggleFullscreen}
        toggleSpeechFollow={() => setIsSpeechFollowEnabled(enabled => !enabled)}
        undoAutoAdvance={undoAutoAdvance}
        voiceError={voiceError}
      />
      <HelpOverlay isOpen={isHelpOpen} onClose={closeHelp} sections={helpSections} />
    </div>
  );
};

const RoutedApp: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div data-theme={theme} className="min-h-screen bg-canvas text-text">
      {isSpeakerNotesRoute() ? <SpeakerNotesView /> : <DeckView />}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <RoutedApp />
  </ThemeProvider>
);

export default App;
