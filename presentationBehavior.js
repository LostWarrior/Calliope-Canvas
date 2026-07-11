// @ts-check

/**
 * @typedef {'next' | 'previous' | 'startAnimation' | 'stopAnimation' | 'zoomIn' | 'zoomOut'} VoiceAction
 * @typedef {{ action: VoiceAction, label: string, phrases: string[] }} VoiceCommand
 * @typedef {{ shortcut: string, description: string }} HelpShortcutItem
 * @typedef {{ title: string, items: HelpShortcutItem[] }} HelpShortcutSection
 */

/** @type {VoiceCommand[]} */
export const VOICE_COMMANDS = [
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

/**
 * @param {string[]} normalizedTranscripts
 * @returns {VoiceCommand | undefined}
 */
export const matchVoiceCommand = normalizedTranscripts =>
  normalizedTranscripts
    .map(transcript =>
      VOICE_COMMANDS.find(command => command.phrases.some(phrase => phrase === transcript))
    )
    .find(Boolean);

const HELP_SHORTCUT_ITEMS = [
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
];

/**
 * @returns {HelpShortcutSection[]}
 */
export const getHelpShortcutSections = () => [
  {
    title: 'Keyboard shortcuts',
    items: HELP_SHORTCUT_ITEMS,
  },
  {
    title: 'Voice commands',
    items: VOICE_COMMANDS.map(command => ({
      shortcut: command.label,
      description: command.phrases.join(' | '),
    })),
  },
];

/**
 * @param {string} key
 * @param {boolean} isHelpOpen
 */
export const isPresentationShortcutAllowed = (key, isHelpOpen) =>
  !isHelpOpen || key === '?' || key === 'Escape';

/**
 * @param {1 | -1} direction
 */
export const getSlideTransitionClass = direction =>
  direction === 1
    ? 'slide-transition slide-transition-forward'
    : 'slide-transition slide-transition-backward';
