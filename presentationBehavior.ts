import type { ProgressBarPosition, VoiceAction } from './types.ts';

export type VoiceCommand = { action: VoiceAction; label: string; phrases: string[] };
export type HelpShortcutItem = { shortcut: string; description: string };
export type HelpShortcutSection = { title: string; items: HelpShortcutItem[] };
export type SlideGroup = { section?: string; slideIndexes: number[] };

export const VOICE_COMMANDS: VoiceCommand[] = [
  { action: 'next', label: 'Next Slide', phrases: ['next slide please', 'next slide'] },
  {
    action: 'previous',
    label: 'Previous Slide',
    phrases: ['previous slide please', 'previous slide', 'lets go back', 'go back'],
  },
  { action: 'startAnimation', label: 'Start Animation', phrases: ['start animation'] },
  { action: 'stopAnimation', label: 'Stop Animation', phrases: ['stop animation'] },
  { action: 'zoomOut', label: 'Zoom Out', phrases: ['zoom out'] },
  { action: 'zoomIn', label: 'Zoom In', phrases: ['zoom in'] },
];

const MISHEARD_COMMAND_WORDS: Record<string, string> = {
  flight: 'slide',
  light: 'slide',
  previews: 'previous',
  side: 'slide',
  slides: 'slide',
  slight: 'slide',
};

const correctMisheardWords = (transcript: string) =>
  transcript
    .split(' ')
    .map(word => MISHEARD_COMMAND_WORDS[word] ?? word)
    .join(' ');

export const matchVoiceCommand = (normalizedTranscripts: string[]): VoiceCommand | undefined =>
  normalizedTranscripts
    .map(correctMisheardWords)
    .map(transcript =>
      VOICE_COMMANDS.find(command => command.phrases.some(phrase => phrase === transcript))
    )
    .find(Boolean);

const HELP_SHORTCUT_ITEMS: HelpShortcutItem[] = [
  { shortcut: 'ArrowRight / ArrowDown', description: 'Next slide' },
  { shortcut: 'ArrowLeft / ArrowUp', description: 'Previous slide' },
  { shortcut: 'Space', description: 'Pause or resume animations' },
  { shortcut: 'F', description: 'Toggle fullscreen' },
  { shortcut: 'V', description: 'Toggle voice recognition' },
  { shortcut: 'U', description: 'Undo the last automatic slide advance' },
  { shortcut: '+ / -', description: 'Zoom in or out' },
  { shortcut: '?', description: 'Open or close this help panel' },
  { shortcut: 'Esc', description: 'Close this help panel' },
  { shortcut: 'H', description: 'Hide or show controls (keeps slide counter visible)' },
  { shortcut: 'P', description: 'Toggle presentation mode (hides voice and follow-speech controls)' },
  { shortcut: 'S', description: 'Show or hide the slide sidebar' },
];

export const getHelpShortcutSections = (): HelpShortcutSection[] => [
  {
    title: 'Keyboard shortcuts',
    items: HELP_SHORTCUT_ITEMS,
  },
  {
    title: 'Voice commands',
    items: [
      ...VOICE_COMMANDS.map(command => ({
        shortcut: command.label,
        description: command.phrases.join(' | '),
      })),
      { shortcut: 'Auto advance', description: 'Turn on auto advance in the footer, then say a slide’s cue' },
    ],
  },
];

export const isPresentationShortcutAllowed = (key: string, isHelpOpen: boolean) =>
  !isHelpOpen || key === '?' || key === 'Escape';

export const getSlideTransitionClass = (direction: 1 | -1) =>
  direction === 1
    ? 'slide-transition slide-transition-forward'
    : 'slide-transition slide-transition-backward';

export const groupSlidesBySection = (slides: { section?: string }[]) =>
  slides.reduce<SlideGroup[]>((groups, slide, index) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.section === slide.section) {
      lastGroup.slideIndexes.push(index);
    } else {
      groups.push({ section: slide.section, slideIndexes: [index] });
    }
    return groups;
  }, []);

export const resolveProgressBarPosition = (position: ProgressBarPosition, isHeaderRowVisible: boolean): ProgressBarPosition =>
  position === 'below-header' && !isHeaderRowVisible ? 'top' : position;

export const SIDEBAR_DEFAULT_WIDTH = 272;
export const SIDEBAR_MIN_WIDTH = 224;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_WIDTH_STEP = 16;

export const getSidebarMaxWidth = (viewportWidth: number) =>
  Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, Math.floor(viewportWidth / 2)));

export const clampSidebarWidth = (width: number, viewportWidth: number) =>
  Math.round(Math.min(getSidebarMaxWidth(viewportWidth), Math.max(SIDEBAR_MIN_WIDTH, width)));

export const parseSidebarWidth = (storedWidth: string | null) => {
  const width = Number(storedWidth);
  return storedWidth && Number.isFinite(width)
    ? Math.round(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width)))
    : SIDEBAR_DEFAULT_WIDTH;
};
