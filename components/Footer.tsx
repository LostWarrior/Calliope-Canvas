interface FooterProps {
    currentSlide: number;
    isFullscreen: boolean;
    isVoiceEnabled: boolean;
    isVoiceListening: boolean;
    isVoiceSupported: boolean;
    lastCommand: string | null;
    lastHeard: string | null;
    slides: React.ReactNode[];
    goToPrev: () => void;
    goToNext: () => void;
    toggleFullscreen: () => void;
    voiceError: string | null;
}

const Footer: React.FC<FooterProps> = ({
    currentSlide,
    goToNext,
    goToPrev,
    isFullscreen,
    isVoiceEnabled,
    isVoiceListening,
    isVoiceSupported,
    lastCommand,
    lastHeard,
    slides,
    toggleFullscreen,
    voiceError,
}) => {
    return <footer className="relative z-20 w-full max-w-7xl py-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-slate-400 font-semibold">Calliope Canvas</div>
          {!isFullscreen && (
            <>
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
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            onClick={goToPrev}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400 font-mono">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-sky-600 rounded-md text-white font-semibold hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            ⛶
          </button>
        </div>
      </footer>;
}

export default Footer;
