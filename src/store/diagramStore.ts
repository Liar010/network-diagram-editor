import { create } from 'zustand';
import { NetworkDevice, Connection, NetworkDiagram, DeviceGroup } from '../types/network';
import { DiagramSnapshot, HistoryState } from '../types/history';
import { generateId } from '../utils/idGenerator';
import { applyLayout, LayoutOptions } from '../utils/layoutUtils';
import { pushToHistory, trimHistory } from '../utils/historyUtils';

interface DiagramState {
  currentDiagram: NetworkDiagram | null;
  devices: NetworkDevice[];
  connections: Connection[];
  groups: DeviceGroup[];
  selectedDevice: NetworkDevice | null;
  selectedConnection: Connection | null;
  selectedDevices: NetworkDevice[];
  selectedConnections: Connection[];
  selectedGroup: DeviceGroup | null;
  clipboard: { devices: NetworkDevice[]; connections: Connection[] } | null;
  history: HistoryState;
  layer: 'L1' | 'L2' | 'L3';
  gridEnabled: boolean;
  gridSize: number;
  
  addDevice: (device: Omit<NetworkDevice, 'id'>) => void;
  updateDevice: (id: string, device: Partial<NetworkDevice>) => void;
  deleteDevice: (id: string) => void;
  selectDevice: (device: NetworkDevice | null) => void;
  
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  updateConnection: (id: string, connection: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  selectConnection: (connection: Connection | null) => void;
  
  setLayer: (layer: 'L1' | 'L2' | 'L3') => void;
  clearDiagram: () => void;
  loadDiagram: (diagram: NetworkDiagram) => void;
  autoLayout: (options: LayoutOptions) => void;
  
  // Multiple selection
  selectMultipleDevices: (devices: NetworkDevice[]) => void;
  selectMultipleConnections: (connections: Connection[]) => void;
  toggleDeviceSelection: (device: NetworkDevice) => void;
  toggleConnectionSelection: (connection: Connection) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  
  // Copy & Paste
  copySelected: () => void;
  paste: (offset?: { x: number; y: number }) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushToHistory: () => void;
  
  // Groups
  createGroupFromSelected: (name: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  addDeviceToGroup: (deviceId: string, groupId: string) => void;
  removeDeviceFromGroup: (deviceId: string, groupId: string) => void;
  
  // Grid
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  currentDiagram: null,
  devices: [],
  connections: [],
  groups: [],
  selectedDevice: null,
  selectedConnection: null,
  selectedDevices: [],
  selectedConnections: [],
  selectedGroup: null,
  clipboard: null,
  history: {
    past: [],
    present: { devices: [], connections: [], timestamp: Date.now() },
    future: []
  },
  layer: 'L3',
  gridEnabled: true,
  gridSize: 20,
  
  addDevice: (device) => set((state) => {
    const newDevices = [...state.devices, { ...device, id: generateId('device') }];
    return {
      devices: newDevices,
      history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
    };
  }),
  
  updateDevice: (id, device) => set((state) => ({
    devices: state.devices.map((d) => d.id === id ? { ...d, ...device } : d),
  })),
  
  deleteDevice: (id) => set((state) => {
    const newDevices = state.devices.filter((d) => d.id !== id);
    const newConnections = state.connections.filter((c) => c.source !== id && c.target !== id);
    return {
      devices: newDevices,
      connections: newConnections,
      history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
    };
  }),
  
  selectDevice: (device) => set({ selectedDevice: device, selectedConnection: null }),
  
  addConnection: (connection) => set((state) => {
    const newConnections = [...state.connections, { 
      ...connection, 
      id: generateId('conn'),
      style: connection.style || {
        strokeStyle: 'solid',
        strokeColor: '#1976d2',
        strokeWidth: 2,
        animated: false
      }
    }];
    return {
      connections: newConnections,
      history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
    };
  }),
  
  updateConnection: (id, connection) => set((state) => {
    const updatedConnections = state.connections.map((c) => {
      if (c.id === id) {
        // Handle style updates
        if (connection.style !== undefined) {
          return { 
            ...c, 
            ...connection,
            style: {
              strokeStyle: connection.style.strokeStyle ?? c.style?.strokeStyle ?? 'solid',
              strokeColor: connection.style.strokeColor ?? c.style?.strokeColor ?? '#1976d2',
              strokeWidth: connection.style.strokeWidth ?? c.style?.strokeWidth ?? 2,
              animated: connection.style.animated ?? c.style?.animated ?? false
            }
          };
        }
        return { ...c, ...connection };
      }
      return c;
    });
    
    // Update selectedConnection if it's the one being updated
    const updatedSelectedConnection = state.selectedConnection?.id === id
      ? updatedConnections.find(c => c.id === id) || null
      : state.selectedConnection;
    
    return {
      connections: updatedConnections,
      selectedConnection: updatedSelectedConnection
    };
  }),
  
  deleteConnection: (id) => set((state) => {
    const newConnections = state.connections.filter((c) => c.id !== id);
    return {
      connections: newConnections,
      history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
    };
  }),
  
  selectConnection: (connection) => set({ selectedConnection: connection, selectedDevice: null }),
  
  setLayer: (layer) => set({ layer }),
  
  clearDiagram: () => set({
    devices: [],
    connections: [],
    groups: [],
    selectedDevice: null,
    selectedConnection: null,
    selectedDevices: [],
    selectedConnections: [],
    selectedGroup: null,
  }),
  
  loadDiagram: (diagram) => set({
    currentDiagram: diagram,
    devices: diagram.devices,
    connections: diagram.connections,
    groups: diagram.groups || [],
    layer: diagram.layer,
    selectedDevice: null,
    selectedConnection: null,
    selectedDevices: [],
    selectedConnections: [],
    selectedGroup: null,
  }),
  
  autoLayout: (options) => set((state) => {
    try {
      const result = applyLayout(state.devices, state.connections, options);
      return {
        devices: result.devices,
        selectedDevice: null,
        selectedConnection: null,
      };
    } catch (error) {
      console.error('Auto layout failed:', error);
      return state; // Return unchanged state if layout fails
    }
  }),
  
  // Multiple selection implementation
  selectMultipleDevices: (devices) => set({
    selectedDevices: devices,
    selectedConnections: [],
    selectedDevice: null,
    selectedConnection: null,
  }),
  
  selectMultipleConnections: (connections) => set({
    selectedConnections: connections,
    selectedDevices: [],
    selectedDevice: null,
    selectedConnection: null,
  }),
  
  toggleDeviceSelection: (device) => set((state) => {
    const isSelected = state.selectedDevices.find(d => d.id === device.id);
    if (isSelected) {
      return {
        selectedDevices: state.selectedDevices.filter(d => d.id !== device.id),
      };
    } else {
      return {
        selectedDevices: [...state.selectedDevices, device],
        selectedConnections: [],
      };
    }
  }),
  
  toggleConnectionSelection: (connection) => set((state) => {
    const isSelected = state.selectedConnections.find(c => c.id === connection.id);
    if (isSelected) {
      return {
        selectedConnections: state.selectedConnections.filter(c => c.id !== connection.id),
      };
    } else {
      return {
        selectedConnections: [...state.selectedConnections, connection],
        selectedDevices: [],
      };
    }
  }),
  
  clearSelection: () => set({
    selectedDevice: null,
    selectedConnection: null,
    selectedDevices: [],
    selectedConnections: [],
  }),
  
  deleteSelected: () => set((state) => {
    const deviceIds = state.selectedDevices.map(d => d.id);
    const connectionIds = state.selectedConnections.map(c => c.id);
    
    return {
      devices: state.devices.filter(d => !deviceIds.includes(d.id)),
      connections: state.connections.filter(c => 
        !connectionIds.includes(c.id) && 
        !deviceIds.includes(c.source) && 
        !deviceIds.includes(c.target)
      ),
      selectedDevices: [],
      selectedConnections: [],
      selectedDevice: null,
      selectedConnection: null,
    };
  }),
  
  // Copy & Paste implementation
  copySelected: () => set((state) => {
    const selectedDevices = [...state.selectedDevices];
    const selectedConnections = [...state.selectedConnections];
    
    // Include single selected items
    if (state.selectedDevice && !selectedDevices.find(d => d.id === state.selectedDevice!.id)) {
      selectedDevices.push(state.selectedDevice);
    }
    if (state.selectedConnection && !selectedConnections.find(c => c.id === state.selectedConnection!.id)) {
      selectedConnections.push(state.selectedConnection);
    }
    
    return {
      clipboard: {
        devices: selectedDevices,
        connections: selectedConnections
      }
    };
  }),
  
  paste: (offset = { x: 50, y: 50 }) => set((state) => {
    if (!state.clipboard) return state;
    
    const deviceIdMap = new Map<string, string>();
    const newDevices: NetworkDevice[] = [];
    
    // Clone devices with new IDs and offset positions
    state.clipboard.devices.forEach(device => {
      const newId = generateId('device');
      deviceIdMap.set(device.id, newId);
      newDevices.push({
        ...device,
        id: newId,
        name: `${device.name} (Copy)`,
        position: {
          x: device.position.x + offset.x,
          y: device.position.y + offset.y
        }
      });
    });
    
    // Clone connections with updated device IDs
    const newConnections: Connection[] = [];
    state.clipboard.connections.forEach(connection => {
      const newSourceId = deviceIdMap.get(connection.source);
      const newTargetId = deviceIdMap.get(connection.target);
      
      // Only add connection if both devices were copied
      if (newSourceId && newTargetId) {
        newConnections.push({
          ...connection,
          id: generateId('conn'),
          source: newSourceId,
          target: newTargetId
        });
      }
    });
    
    // Clear clipboard after paste to prevent accumulation
    return {
      devices: [...state.devices, ...newDevices],
      connections: [...state.connections, ...newConnections],
      selectedDevices: newDevices,
      selectedConnections: newConnections,
      selectedDevice: null,
      selectedConnection: null,
      clipboard: null,
    };
  }),
  
  // Undo/Redo implementation
  pushToHistory: () => set((state) => {
    const snapshot: DiagramSnapshot = {
      devices: [...state.devices],
      connections: [...state.connections],
      timestamp: Date.now()
    };
    
    return {
      history: {
        past: [...state.history.past, state.history.present],
        present: snapshot,
        future: [] // Clear future when new action is performed
      }
    };
  }),
  
  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    
    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    
    return {
      devices: [...previous.devices],
      connections: [...previous.connections],
      history: {
        past: newPast,
        present: previous,
        future: [state.history.present, ...state.history.future]
      },
      selectedDevice: null,
      selectedConnection: null,
      selectedDevices: [],
      selectedConnections: [],
    };
  }),
  
  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    
    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    
    return {
      devices: [...next.devices],
      connections: [...next.connections],
      history: {
        past: [...state.history.past, state.history.present],
        present: next,
        future: newFuture
      },
      selectedDevice: null,
      selectedConnection: null,
      selectedDevices: [],
      selectedConnections: [],
    };
  }),
  
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
  
  // Groups - stub implementation for now
  createGroupFromSelected: (name) => set((state) => state),
  toggleGroupCollapse: (groupId) => set((state) => state),
  deleteGroup: (groupId) => set((state) => state),
  addDeviceToGroup: (deviceId, groupId) => set((state) => state),
  removeDeviceFromGroup: (deviceId, groupId) => set((state) => state),
  
  // Grid
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSize: (size) => set({ gridSize: size }),
}));