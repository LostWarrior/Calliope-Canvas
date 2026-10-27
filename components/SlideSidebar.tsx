import React, { useEffect, useId, useMemo, useRef } from 'react';
import type { SidebarConfig, SlideDefinition } from '../types';
import { groupSlidesBySection } from '../presentationBehavior';
import { CloseIcon } from './Icons';
import ThemedButton from './ThemedButton';

interface SlideSidebarProps {
  config: SidebarConfig;
  slides: SlideDefinition[];
  currentSlide: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

const formatNumber = (value: number) => String(value).padStart(2, '0');

const SlideSidebar: React.FC<SlideSidebarProps> = ({ config, slides, currentSlide, onSelect, onClose }) => {
  const slideButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const headingId = useId();
  const groups = useMemo(() => {
    let sectionNumber = 0;
    return groupSlidesBySection(slides).map(group => ({ ...group, number: group.section ? ++sectionNumber : 0 }));
  }, [slides]);
  const label = config.label || 'Slides';

  useEffect(() => {
    slideButtons.current[currentSlide]?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    slideButtons.current[currentSlide]?.scrollIntoView({ block: 'nearest' });
  }, [currentSlide]);

  const renderSlide = (index: number) => {
    const title = slides[index].title || `Slide ${index + 1}`;
    const isCurrent = index === currentSlide;

    return (
      <li key={index}>
        <button
          ref={element => { slideButtons.current[index] = element; }}
          type="button"
          aria-label={`Go to slide ${index + 1}: ${title}`}
          aria-current={isCurrent ? 'step' : undefined}
          onClick={() => onSelect(index)}
          className={`flex w-full items-baseline gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-motion outline-hidden focus-visible:ring-2 focus-visible:ring-focus ${isCurrent ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-elevated hover:text-text'}`}
        >
          <span aria-hidden="true" className="shrink-0 font-mono text-[0.7rem] opacity-70">{formatNumber(index + 1)}</span>
          <span className={`min-w-0 break-words text-sm leading-5 ${isCurrent ? 'font-semibold' : ''}`}>{title}</span>
        </button>
      </li>
    );
  };

  return (
    <aside id="slide-sidebar" aria-labelledby={headingId} className="slide-sidebar-panel fixed inset-y-0 left-0 z-40 flex w-64 max-w-[calc(100vw-3rem)] flex-col overflow-hidden border-r border-border bg-surface shadow-[12px_0_48px_rgb(0_0_0_/_0.12)] md:shadow-none">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgb(var(--theme-primary)_/_0.14),_transparent_70%)]" />

      <div className="relative flex shrink-0 items-start justify-between gap-3 px-5 pt-6 pb-4">
        <div className="min-w-0">
          {config.eyebrow && (
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">{config.eyebrow}</p>
          )}
          <h2 id={headingId} className={`break-words text-xl font-semibold text-text ${config.eyebrow ? 'mt-2' : ''}`}>
            {config.title || label}
          </h2>
        </div>
        <ThemedButton variant="ghost" onClick={onClose} aria-label="Hide sidebar" title="Hide sidebar" className="shrink-0 rounded-full px-1.5!">
          <CloseIcon className="h-4 w-4" />
        </ThemedButton>
      </div>

      <nav aria-label={label} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4" onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
          return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          const focusedIndex = slideButtons.current.indexOf(document.activeElement as HTMLButtonElement);
          const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1
            : Math.max(0, Math.min(slides.length - 1, focusedIndex + (event.key === 'ArrowDown' ? 1 : -1)));
          slideButtons.current[nextIndex]?.focus();
        }
      }}>
        {groups.map(group => {
          const firstIndex = group.slideIndexes[0];

          if (!group.section) {
            return <ol key={firstIndex} className="space-y-0.5 py-1">{group.slideIndexes.map(renderSlide)}</ol>;
          }

          const groupHeadingId = `${headingId}-section-${firstIndex}`;
          const isCurrentGroup = group.slideIndexes.includes(currentSlide);
          const slideCount = group.slideIndexes.length;

          return (
            <section key={firstIndex} aria-labelledby={groupHeadingId} className="py-1">
              <div className={`flex items-baseline gap-3 rounded-2xl border px-3 py-3 transition-colors duration-motion ${isCurrentGroup ? 'border-primary/25 bg-primary/10' : 'border-transparent'}`}>
                <span aria-hidden="true" className="shrink-0 font-mono text-xs font-semibold text-primary">{formatNumber(group.number)}</span>
                <div className="min-w-0">
                  <h3 id={groupHeadingId} className="break-words text-sm font-semibold leading-5 text-text">{group.section}</h3>
                  <p className="mt-1 text-xs text-muted">{slideCount} {slideCount === 1 ? 'slide' : 'slides'}</p>
                </div>
              </div>
              <ol aria-labelledby={groupHeadingId} className="mt-1 ml-5 space-y-0.5 border-l border-border pl-2">
                {group.slideIndexes.map(renderSlide)}
              </ol>
            </section>
          );
        })}
      </nav>

      {config.footnote && (
        <p className="relative shrink-0 border-t border-border px-5 py-4 text-xs text-muted">{config.footnote}</p>
      )}
    </aside>
  );
};

export default SlideSidebar;
