import React, { useEffect, useId, useRef } from 'react';

type HelpShortcutItem = {
  shortcut: string;
  description: string;
};

type HelpShortcutSection = {
  items: HelpShortcutItem[];
  title: string;
};

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sections: HelpShortcutSection[];
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose, sections }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-2xl"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="help-modal-panel relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 p-6 text-slate-100 shadow-[0_30px_120px_rgba(2,6,23,0.55)] ring-1 ring-white/10 sm:p-8"
        onClick={event => event.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_42%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-sky-300">
              Keyboard Help
            </p>
            <h2 id={titleId} className="mt-3 text-3xl font-semibold text-white">
              Shortcuts and voice commands
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Use the deck without hunting through the README. Press <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-white">?</span> or <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-white">Esc</span> to close this panel.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="relative mt-8 grid gap-6 lg:grid-cols-2">
          {sections.map(section => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/10"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.items.map(item => (
                  <li
                    key={`${section.title}-${item.shortcut}-${item.description}`}
                    className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="min-w-0 text-sm text-slate-200">{item.description}</span>
                    <span className="shrink-0 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-slate-100">
                      {item.shortcut}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;
