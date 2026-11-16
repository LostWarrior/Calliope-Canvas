import type { HelpShortcutItem, HelpShortcutSection, VoiceCommand } from './types.ts';

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
      { shortcut: 'Auto advance (speech bubble button)', description: 'Advance automatically when you say a slide’s cue' },
    ],
  },
];

export const isPresentationShortcutAllowed = (key: string, isHelpOpen: boolean) =>
  !isHelpOpen || key === '?' || key === 'Escape';

export const getSlideTransitionClass = (direction: 1 | -1) =>
  direction === 1
    ? 'slide-transition slide-transition-forward'
    : 'slide-transition slide-transition-backward';
