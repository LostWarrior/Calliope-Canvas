interface FooterProps {
    currentSlide: number;
    slides: React.ReactNode[];
    goToPrev: () => void;
    goToNext: () => void;
    toggleFullscreen: () => void;
}

const Footer: React.FC<FooterProps> = ({ currentSlide, slides, goToPrev, goToNext, toggleFullscreen }) => {
    return <footer className="w-full max-w-7xl py-4 flex items-center justify-between">
        <div className="text-slate-400 font-semibold">Calliope Canvas</div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            ⛶
          </button>
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
        </div>
      </footer>;
}

export default Footer;
