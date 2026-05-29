import React from 'react';
import { NotesIcon } from './Icons';

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
        <div className={`font-semibold transition-opacity duration-300 ${isControlsHidden ? 'text-slate-500 opacity-60' : 'text-slate-400'}`}>Calliope Canvas</div>

        <div className="relative flex items-center">
          <div className={`flex flex-wrap items-center gap-2 transition-opacity duration-300 ${isControlsHidden ? 'opacity-0 pointer-events-none' : ''}`}>
            <button
              onClick={goToPrev}
              disabled={currentSlide === 0}
              className="px-3 py-1.5 text-sm bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400 font-mono">
              {currentSlide + 1} / {slideCount}
            </span>
            <button
              onClick={goToNext}
              disabled={currentSlide === slideCount - 1}
              className="px-3 py-1.5 text-sm bg-sky-600 rounded-md text-white font-semibold hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={openSpeakerNotesView}
              className="px-3 py-1.5 text-sm bg-slate-700 rounded-md text-white hover:bg-slate-600 transition-colors flex items-center justify-center"
              title="Open speaker notes"
            >
              <NotesIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 text-sm bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 transition-colors"
              title="Toggle Fullscreen (F)"
            >
              ⛶
            </button>
          </div>
          <span className={`absolute inset-0 flex items-center justify-end transition-opacity duration-300 pointer-events-none font-mono text-sm text-slate-500 ${isControlsHidden ? 'opacity-60' : 'opacity-0'}`}>
            {currentSlide + 1} / {slideCount}
          </span>
        </div>
      </div>

      {!isFullscreen && !isControlsHidden && (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-slate-500">
            Voice asks for microphone permission on load. Try: &quot;Next Slide&quot;, &quot;Let&apos;s go back&quot;, &quot;Start Animation&quot;, &quot;Stop Animation&quot;, &quot;Zoom In&quot;, &quot;Zoom Out&quot;
          </div>
          <div className="text-sm text-slate-400">
            {voiceError ? (
              <span className="text-rose-400">{voiceError}</span>
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
