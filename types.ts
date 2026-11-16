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
  speech?: {
    cues: string[];
  };
  title?: string;
}

export type VoiceAction =
  | 'next'
  | 'previous'
  | 'startAnimation'
  | 'stopAnimation'
  | 'zoomIn'
  | 'zoomOut';
