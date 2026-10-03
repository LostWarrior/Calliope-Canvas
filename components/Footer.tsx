import React from 'react';
import { FollowSpeechIcon, NotesIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface FooterProps {
  currentSlide: number;
  isControlsHidden: boolean;
  isPresentationMode: boolean;
  isSpeechFollowEnabled: boolean;
  isVoiceEnabled: boolean;
  isVoiceSupported: boolean;
  lastCommand: string | null;
  lastAutoAdvance: {
    cue: string;
    fromSlide: number;
    toSlide: number;
  } | null;
  lastHeard: string | null;
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
  isPresentationMode,
  isSpeechFollowEnabled,
  isVoiceEnabled,
  isVoiceSupported,
  lastCommand,
  lastAutoAdvance,
  lastHeard,
  openSpeakerNotesView,
  slideCount,
  toggleFullscreen,
  toggleSpeechFollow,
  voiceError,
}) => {
  return (
    <footer className="relative z-20 w-full max-w-7xl py-4 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className={`font-semibold transition-opacity duration-300 ${isControlsHidden ? 'text-muted opacity-60' : 'text-muted'}`}>Calliope Canvas</div>

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
            <ThemedButton
              onClick={openSpeakerNotesView}
              title="Open speaker notes"
            >
              <NotesIcon className="h-5 w-5" />
            </ThemedButton>
            <ThemedButton
              onClick={toggleFullscreen}
              title="Toggle Fullscreen (F)"
            >
              ⛶
            </ThemedButton>
            {!isPresentationMode && (
              <ThemedButton
                onClick={toggleSpeechFollow}
                disabled={!isVoiceEnabled}
                variant={isSpeechFollowEnabled ? 'primary' : 'secondary'}
                aria-pressed={isSpeechFollowEnabled}
                title={
                  isVoiceEnabled
                    ? `Follow speech: ${isSpeechFollowEnabled ? 'On' : 'Off'} — matching phrases can advance to the next slide automatically.`
                    : 'Follow speech is unavailable until voice recognition is on.'
                }
              >
                <FollowSpeechIcon className="h-5 w-5" />
              </ThemedButton>
            )}
          </div>
          <span className={`absolute inset-0 flex items-center justify-end transition-opacity duration-300 pointer-events-none font-mono text-sm text-muted ${isControlsHidden ? 'opacity-60' : 'opacity-0'}`}>
            {currentSlide + 1} / {slideCount}
          </span>
        </div>
      </div>

      {!isControlsHidden && !isPresentationMode && (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted">
            {isVoiceSupported && 'Say “next slide” or “go back” anytime. '}
            Press Shift + ? for all commands.
          </div>
          {voiceError ? (
            <div className="text-sm text-danger">{voiceError}</div>
          ) : !isVoiceSupported ? (
            <div className="text-sm text-muted">Voice control isn’t supported in this browser.</div>
          ) : lastCommand ? (
            <div className="text-sm text-muted">Last command: {lastCommand}</div>
          ) : null}
          {(lastHeard || lastAutoAdvance) && (
            <div className="text-sm text-muted">
              {[
                lastHeard && `Last transcript: ${lastHeard}`,
                lastAutoAdvance
                  && `Last auto-transition: ${lastAutoAdvance.fromSlide + 1} → ${lastAutoAdvance.toSlide + 1} • Cue: ${lastAutoAdvance.cue}`,
              ].filter(Boolean).join(' • ')}
            </div>
          )}
        </div>
      )}
    </footer>
  );
}

export default Footer;
