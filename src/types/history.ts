import { NetworkDevice, Connection } from './network';

export interface DiagramSnapshot {
  devices: NetworkDevice[];
  connections: Connection[];
  timestamp: number;
}

export interface HistoryState {
  past: DiagramSnapshot[];
  present: DiagramSnapshot;
  future: DiagramSnapshot[];
}