import React from 'react';
import { FollowSpeechIcon, NotesIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface FooterProps {
  currentSlide: number;
  isControlsHidden: boolean;
  isFullscreen: boolean;
  isPresentationMode: boolean;
  isRecording: boolean;
  isSpeechFollowEnabled: boolean;
  isVoiceEnabled: boolean;
  isVoiceSupported: boolean;
  lastCommand: string | null;
  openSpeakerNotesView: () => void;
  slideCount: number;
  goToPrev: () => void;
  goToNext: () => void;
  toggleFullscreen: () => void;
  toggleSpeechFollow: () => void;
  voiceError: string | null;
}

const Footer: React.FC<FooterProps> = ({
  currentSlide,
  goToNext,
  goToPrev,
  isControlsHidden,
  isFullscreen,
  isPresentationMode,
  isRecording,
  isSpeechFollowEnabled,
  isVoiceEnabled,
  isVoiceSupported,
  lastCommand,
  openSpeakerNotesView,
  slideCount,
  toggleFullscreen,
  toggleSpeechFollow,
  voiceError,
}) => {
  const showRecording = isRecording && !isPresentationMode;
  const showVoiceUnsupported = !isVoiceSupported && !isControlsHidden && !isPresentationMode;

  return (
    <footer className="relative z-20 w-full max-w-7xl py-4 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className={`font-semibold transition-opacity duration-300 ${isControlsHidden ? 'text-muted opacity-60' : 'text-muted'}`}>Calliope Canvas</div>

        <div className="relative flex flex-col gap-1.5 lg:items-end">
          <div className="relative flex items-center">
            <div className={`flex flex-wrap items-center gap-2 transition-opacity duration-300 ${isControlsHidden ? 'opacity-0 pointer-events-none' : ''}`}>
              <ThemedButton
                onClick={goToPrev}
                disabled={currentSlide === 0}
              >
                Previous
              </ThemedButton>
              <span className="text-muted font-mono">
                {currentSlide + 1} / {slideCount}
              </span>
              <ThemedButton
                onClick={goToNext}
                disabled={currentSlide === slideCount - 1}
                variant="primary"
              >
                Next
              </ThemedButton>
              {!isFullscreen && (
                <ThemedButton
                  onClick={openSpeakerNotesView}
                  title="Open speaker notes"
                  aria-label="Open speaker notes"
                >
                  <NotesIcon className="h-5 w-5" />
                </ThemedButton>
              )}
              <ThemedButton
                onClick={toggleFullscreen}
                title="Toggle Fullscreen (F)"
              >
                ⛶
              </ThemedButton>
              {!isPresentationMode && isVoiceSupported && (
                <ThemedButton
                  onClick={toggleSpeechFollow}
                  disabled={!isVoiceEnabled}
                  variant={isSpeechFollowEnabled ? 'primary' : 'secondary'}
                  aria-pressed={isSpeechFollowEnabled}
                  title="Auto advance slides with speech"
                  aria-label="Auto advance slides with speech"
                >
                  <FollowSpeechIcon className="h-5 w-5" />
                </ThemedButton>
              )}
            </div>
            <span className={`absolute inset-0 flex items-center justify-end transition-opacity duration-300 pointer-events-none font-mono text-sm text-muted ${isControlsHidden ? 'opacity-60' : 'opacity-0'}`}>
              {currentSlide + 1} / {slideCount}
            </span>
          </div>
          {(showRecording || showVoiceUnsupported) && (
            <div className="text-xs lg:absolute lg:top-full lg:right-0 lg:mt-3 lg:whitespace-nowrap">
              {showRecording && (
                <div role="status" className="flex items-center gap-1.5 font-semibold text-danger">
                  <span className="h-2 w-2 rounded-full bg-danger motion-safe:animate-pulse" />
                  Recording transcript
                </div>
              )}
              {showVoiceUnsupported && (
                <div className="text-muted">Voice control isn’t supported in this browser.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isControlsHidden && !isPresentationMode && (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted">
            {isVoiceSupported && 'Say “next slide” or “go back” anytime. '}
            Press Shift + ? for all commands.
          </div>
          {voiceError ? (
            <div className="text-xs text-danger">{voiceError}</div>
          ) : lastCommand ? (
            <div className="text-xs text-muted">Last command: {lastCommand}</div>
          ) : null}
        </div>
      )}
    </footer>
  );
}

export default Footer;
