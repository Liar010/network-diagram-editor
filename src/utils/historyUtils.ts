import { DiagramSnapshot, HistoryState } from '../types/history';
import { NetworkDevice, Connection } from '../types/network';

export const createSnapshot = (devices: NetworkDevice[], connections: Connection[]): DiagramSnapshot => ({
  devices: [...devices],
  connections: [...connections],
  timestamp: Date.now()
});

export const pushToHistory = (
  currentHistory: HistoryState,
  devices: NetworkDevice[],
  connections: Connection[]
): HistoryState => ({
  past: [...currentHistory.past, currentHistory.present],
  present: createSnapshot(devices, connections),
  future: []
});

export const MAX_HISTORY_SIZE = 50;

export const trimHistory = (history: HistoryState): HistoryState => {
  if (history.past.length <= MAX_HISTORY_SIZE) return history;
  
  return {
    ...history,
    past: history.past.slice(-MAX_HISTORY_SIZE)
  };
};