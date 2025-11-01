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
