import React, { useState } from 'react';
import TitleSlide from './slides/TitleSlide';
import Footer from './components/Footer';

const slides = [
  <TitleSlide />,
];

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };

  const goToPrev = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
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

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
        <div className="slide-container w-full">
            {slides[currentSlide]}
        </div>
      </main>
     <Footer 
      currentSlide={currentSlide}
      slides={slides}
      goToPrev={goToPrev} 
      goToNext={goToNext} 
      toggleFullscreen={toggleFullscreen} 
      />
    </div>
  );
};

export default App;
