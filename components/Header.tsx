import React from 'react';
import type { SlideDefinition } from '../types';
import { PresentationIcon, SidebarIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface HeaderProps {
  activeSlide: SlideDefinition;
  currentSlide: number;
  isFullscreen: boolean;
  isPresentationMode: boolean;
  isSidebarVisible: boolean;
  sidebarLabel: string;
  slideCount: number;
  toggleSidebar: () => void;
  togglePresentationMode: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeSlide,
  currentSlide,
  isFullscreen,
  isPresentationMode,
  isSidebarVisible,
  sidebarLabel,
  slideCount,
  toggleSidebar,
  togglePresentationMode,
}) => {
  const sidebarToggleLabel = isSidebarVisible ? 'Hide sidebar' : 'Show sidebar';

  return (
    <>
      <div className="progress-bar w-full" style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }}></div>
      {!isPresentationMode && !isFullscreen && (
        <div className={`fixed top-4 z-30 items-center gap-4 ${isSidebarVisible ? 'left-[17rem] hidden md:flex' : 'left-4 flex'}`}>
          <ThemedButton
            id="slide-sidebar-toggle"
            onClick={toggleSidebar}
            variant="ghost"
            title={sidebarToggleLabel}
            aria-label={sidebarToggleLabel}
            aria-expanded={isSidebarVisible}
            aria-controls={isSidebarVisible ? 'slide-sidebar' : undefined}
            className="gap-2 border border-border"
          >
            <SidebarIcon className="h-5 w-5" />
            <span>{sidebarLabel}</span>
          </ThemedButton>
          {activeSlide.section && (
            <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
              <ol className="flex min-w-0 items-center gap-2 text-sm">
                <li className="shrink-0 font-semibold text-text">{activeSlide.section}</li>
                {activeSlide.title && (
                  <li aria-current="page" className="flex min-w-0 items-center gap-2 text-muted">
                    <span aria-hidden="true" className="opacity-60">/</span>
                    <span className="max-w-[40vw] truncate">{activeSlide.title}</span>
                  </li>
                )}
              </ol>
            </nav>
          )}
        </div>
      )}
      <ThemedButton
        onClick={togglePresentationMode}
        variant={isPresentationMode ? 'primary' : 'ghost'}
        title="Toggle presentation mode (P)"
        aria-pressed={isPresentationMode}
        className="fixed top-4 right-4 z-30"
      >
        <PresentationIcon className="h-5 w-5" />
      </ThemedButton>
    </>
  );
};

export default Header;
