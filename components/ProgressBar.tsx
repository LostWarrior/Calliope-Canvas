import React from 'react';
import type { ProgressBarPosition } from '../types';

interface ProgressBarProps {
  currentSlide: number;
  isSidebarVisible: boolean;
  position: Exclude<ProgressBarPosition, 'hidden'>;
  slideCount: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentSlide, isSidebarVisible, position, slideCount }) => {
  const isBelowHeader = position === 'below-header';
  const placement = isBelowHeader
    ? `top-16 right-4 h-0.5 bg-border ${isSidebarVisible ? 'left-4 md:left-[calc(var(--sidebar-width)+1rem)]' : 'left-4'}`
    : `${position === 'bottom' ? 'bottom-0' : 'top-0'} right-0 h-[3px] ${isSidebarVisible ? 'left-0 md:left-(--sidebar-width)' : 'left-0'}`;

  return (
    <div
      role="progressbar"
      aria-label="Slide progress"
      aria-valuemin={1}
      aria-valuemax={slideCount}
      aria-valuenow={currentSlide + 1}
      aria-valuetext={`Slide ${currentSlide + 1} of ${slideCount}`}
      className={`pointer-events-none fixed z-20 ${placement}`}
    >
      <div className="progress-bar-fill h-full" style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }} />
    </div>
  );
};

export default ProgressBar;
