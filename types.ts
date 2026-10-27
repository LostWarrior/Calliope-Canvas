export enum AnimationState {
  Idle = 'IDLE',
  Snapshot = 'SNAPSHOT',
  Streaming = 'STREAMING',
  Synced = 'SYNCED',
}

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
