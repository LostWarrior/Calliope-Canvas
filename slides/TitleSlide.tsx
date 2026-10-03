import React from 'react';

import logoUrl from '../images/logo.png';

const LOGO_MASK_STYLE: React.CSSProperties = {
  WebkitMask: `url(${logoUrl}) center / contain no-repeat`,
  mask: `url(${logoUrl}) center / contain no-repeat`,
};

const TitleSlide: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-[70vh]">
        <div
          role="img"
          aria-label="Calliope Canvas logo"
          style={LOGO_MASK_STYLE}
          className="mb-8 h-36 w-40 bg-linear-to-r from-primary to-accent"
        />
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            Calliope Canvas
        </h1>
        <p className="mt-4 text-2xl text-muted">
            Bring your presentations to life.
        </p>
        <p className="mt-12 text-lg text-text">Click 'Next' to begin.</p>
    </div>
  );
};

export default TitleSlide;
