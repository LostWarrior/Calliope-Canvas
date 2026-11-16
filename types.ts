export const AnimationState = {
  Idle: 'IDLE',
  Snapshot: 'SNAPSHOT',
  Streaming: 'STREAMING',
  Synced: 'SYNCED',
} as const;
export type AnimationState = (typeof AnimationState)[keyof typeof AnimationState];

export interface DataPacket {
  id: number;
  type: 'snapshot' | 'cdc';
  positionClass: string;
  verticalOffsetClass: string;
  opacityClass: string;
}

export interface SlideDefinition {
  content: React.ReactNode;
  notes?: React.ReactNode[];
  section?: string;
  speech?: {
    cues: string[];
  };
  title?: string;
}

export interface SlideGroup {
  section?: string;
  slideIndexes: number[];
}

export interface HeaderConfig {
  show?: boolean;
  breadcrumb?: boolean;
}

export type ProgressBarPosition = 'top' | 'below-header' | 'bottom' | 'hidden';

export interface ProgressBarConfig {
  position?: ProgressBarPosition;
}

export interface SidebarConfig {
  label?: string;
  eyebrow?: string;
  title?: string;
  footnote?: string;
}

export type VoiceAction =
  | 'next'
  | 'previous'
  | 'startAnimation'
  | 'stopAnimation'
  | 'zoomIn'
  | 'zoomOut';

export type VoiceCommand = { action: VoiceAction; label: string; phrases: string[] };
export type HelpShortcutItem = { shortcut: string; description: string };
export type HelpShortcutSection = { title: string; items: HelpShortcutItem[] };
export type TranscriptEntry = { slide: number; text: string; timestamp: number };
