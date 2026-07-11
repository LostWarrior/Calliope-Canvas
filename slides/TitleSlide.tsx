import React from 'react';

const TitleSlide: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-[70vh]">
        <img src="../images/logo-on-black.png" alt="Calliope Canvas Logo" className="h-32 w-32 rounded-full mb-8 shadow-2xl" />
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
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
