import React, { useEffect, useRef, useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import SlideSidebar from './components/SlideSidebar';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import type { HeaderConfig, ProgressBarConfig, SidebarConfig, SlideDefinition, VoiceAction } from './types';
import { isSpeakerNotesRoute, SpeakerNotesView, SPEAKER_NOTES_QUERY_PARAM, SPEAKER_NOTES_CHANNEL, postSpeakerNotesDeckClosed, postSpeakerNotesState, isSpeakerNotesMessage, type DeckState } from './SpeakerNotes';
import HelpOverlay from './components/HelpOverlay';
import { getHelpShortcutSections, getSlideTransitionClass, isPresentationShortcutAllowed, parseSidebarWidth, resolveProgressBarPosition } from './presentationBehavior';
import { useSpeechRecognition, type FinalSpeechRecognitionResult } from './hooks/useSpeechRecognition';
import { useSpeechFollow } from './hooks/useSpeechFollow';
import { useTranscriptRecording } from './hooks/useTranscriptRecording';
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

export const sidebarConfig: SidebarConfig = {
  label: 'Slides',
};

export const headerConfig: HeaderConfig = {
  show: true,
  breadcrumb: true,
};

export const progressBarConfig: ProgressBarConfig = {
  position: 'top',
};

const SIDEBAR_WIDTH_STORAGE_KEY = 'calliope-canvas-sidebar-width';

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
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => parseSidebarWidth(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)));
  const isSidebarVisible = isSidebarOpen && !isPresentationMode && !isFullscreen;
  const isHeaderVisible = headerConfig.show !== false;
  const progressBarPosition = resolveProgressBarPosition(progressBarConfig.position ?? 'top', isHeaderVisible && !isPresentationMode && !isFullscreen);
  const activeSlide = slides[currentSlide];
  const { setTheme, theme } = useTheme();

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    requestAnimationFrame(() => document.getElementById('slide-sidebar-toggle')?.focus());
  };

  const toggleSidebar = () => {
    if (isSidebarVisible) closeSidebar();
    else setIsSidebarOpen(true);
  };

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const currentSlideRef = useRef(currentSlide);
  const deckStateRef = useRef<DeckState>({ canRecord: false, currentSlide, isRecording: false, theme, transcript: [] });
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

  const togglePresentationMode = () => {
    setIsPresentationMode(prev => !prev);
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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      postSpeakerNotesState(speakerNotesChannelRef.current, deckStateRef.current);
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
        postSpeakerNotesState(channel, deckStateRef.current);
        return;
      }

      if (event.data.type === 'speaker-notes-set-recording') {
        setRecording(event.data.isRecording);
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

    postSpeakerNotesState(channel, deckStateRef.current);

    const handlePageHide = () => postSpeakerNotesDeckClosed(channel);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      channel.close();

      if (speakerNotesChannelRef.current === channel) {
        speakerNotesChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

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
    isVoiceSupported,
    requestMicrophonePermission,
    setVoiceControlsEnabled,
    voiceError,
  } = useSpeechRecognition({
    onFinalResult: result => {
      captureSpeech(result.transcript);
      speechFollowResultHandlerRef.current(result);
    },
  });
  const { captureSpeech, isRecording, setRecording, transcript } = useTranscriptRecording({
    canRecord: isVoiceEnabled,
    currentSlideRef,
  });

  useEffect(() => {
    deckStateRef.current = { canRecord: isVoiceEnabled, currentSlide, isRecording, theme, transcript };
    postSpeakerNotesState(speakerNotesChannelRef.current, deckStateRef.current);
  }, [currentSlide, isRecording, isVoiceEnabled, theme, transcript]);
  const {
    isSpeechFollowEnabled,
    lastCommand,
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

      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      // Let native buttons activate with Space without also toggling animations.
      if (e.key === ' ' && e.target instanceof HTMLElement && e.target.closest('button')) {
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
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePresentationMode();
      } else if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey && !isPresentationMode && !isFullscreen) {
        e.preventDefault();
        toggleSidebar();
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
  }, [animationsPaused, isFullscreen, isHelpOpen, isPresentationMode, isSidebarVisible, isVoiceEnabled, requestMicrophonePermission, setVoiceControlsEnabled, undoAutoAdvance]);

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-center bg-canvas p-4 font-sans text-text ${isSidebarVisible ? 'md:pl-[calc(var(--sidebar-width)+1rem)]' : ''}`}
      style={{ '--sidebar-width': `min(${sidebarWidth}px, 50vw)` } as React.CSSProperties}
    >
      {isSidebarVisible && (
        <SlideSidebar config={sidebarConfig} slides={slides} currentSlide={currentSlide} onClose={closeSidebar} onResize={setSidebarWidth} onSelect={goToSlide} width={sidebarWidth} />
      )}
      {progressBarPosition !== 'hidden' && (
        <ProgressBar currentSlide={currentSlide} isSidebarVisible={isSidebarVisible} position={progressBarPosition} slideCount={slides.length} />
      )}
      {isHeaderVisible && (
        <Header
          activeSlide={activeSlide}
          isFullscreen={isFullscreen}
          isPresentationMode={isPresentationMode}
          isSidebarVisible={isSidebarVisible}
          showBreadcrumb={headerConfig.breadcrumb !== false}
          sidebarLabel={sidebarConfig.label || 'Slides'}
          toggleSidebar={toggleSidebar}
          togglePresentationMode={togglePresentationMode}
        />
      )}
      <main className="relative z-0 w-full max-w-7xl grow flex flex-col items-center justify-center">
        <div
          className={`presentation-stage w-full ${animationsPaused ? 'animations-paused' : ''}`}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="slide-container w-full">
            <div key={currentSlide} className={getSlideTransitionClass(slideDirection)}>
              {activeSlide.content}
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
        isVoiceSupported={isVoiceSupported}
        isSpeechFollowEnabled={isSpeechFollowEnabled}
        isFullscreen={isFullscreen}
        isPresentationMode={isPresentationMode || isFullscreen}
        isRecording={isRecording}
        lastCommand={lastCommand}
        openSpeakerNotesView={openSpeakerNotesView}
        slideCount={slides.length}
        toggleFullscreen={toggleFullscreen}
        toggleSpeechFollow={() => setIsSpeechFollowEnabled(enabled => !enabled)}
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
