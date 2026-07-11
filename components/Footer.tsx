import React from 'react';
import { NotesIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface FooterProps {
  currentSlide: number;
  isControlsHidden: boolean;
  isFullscreen: boolean;
  isVoiceEnabled: boolean;
  isVoiceListening: boolean;
  isVoiceSupported: boolean;
  lastCommand: string | null;
  lastHeard: string | null;
  openSpeakerNotesView: () => void;
  slideCount: number;
  goToPrev: () => void;
  goToNext: () => void;
  toggleFullscreen: () => void;
  voiceError: string | null;
}

const Footer: React.FC<FooterProps> = ({
  currentSlide,
  goToNext,
  goToPrev,
  isControlsHidden,
  isFullscreen,
  isVoiceEnabled,
  isVoiceListening,
  isVoiceSupported,
  lastCommand,
  lastHeard,
  openSpeakerNotesView,
  slideCount,
  toggleFullscreen,
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
          </div>
          <span className={`absolute inset-0 flex items-center justify-end transition-opacity duration-300 pointer-events-none font-mono text-sm text-muted ${isControlsHidden ? 'opacity-60' : 'opacity-0'}`}>
            {currentSlide + 1} / {slideCount}
          </span>
        </div>
      </div>

      {!isFullscreen && !isControlsHidden && (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted">
            Voice asks for microphone permission on load. Try: &quot;Next Slide&quot;, &quot;Let&apos;s go back&quot;, &quot;Start Animation&quot;, &quot;Stop Animation&quot;, &quot;Zoom In&quot;, &quot;Zoom Out&quot;
          </div>
          <div className="text-sm text-muted">
            {voiceError ? (
              <span className="text-danger">{voiceError}</span>
            ) : isVoiceSupported ? (
              <span>
                Voice {isVoiceListening ? 'listening' : isVoiceEnabled ? 'armed' : 'off'}
                {lastCommand ? ` • Last command: ${lastCommand}` : ''}
                {!lastCommand && lastHeard ? ` • Heard: ${lastHeard}` : ''}
              </span>
            ) : (
              <span>Voice commands are not available in this browser.</span>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
