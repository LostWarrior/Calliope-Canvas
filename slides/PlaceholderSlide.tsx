import React from 'react';

const PlaceholderSlide: React.FC = () => {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="flex aspect-square w-full max-w-3xl flex-col items-center justify-center px-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">
          Placeholder
        </p>
        <h2 className="mt-8 text-5xl font-semibold text-white">
          Add your slide here
        </h2>
        <p className="mt-6 text-xl leading-relaxed text-slate-400">
          Replace this component with the next part of your presentation.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderSlide;
