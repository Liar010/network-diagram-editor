import { create } from 'zustand';
import { DiagramSnapshot, HistoryState } from '../types/history';
import { NetworkDevice, Connection, NetworkDiagram, DeviceGroup } from '../types/network';
import { pushToHistory, trimHistory } from '../utils/historyUtils';
import { generateId } from '../utils/idGenerator';
import { applyLayout, LayoutOptions } from '../utils/layoutUtils';
import { determineLinkStatus, getConnectionStyleFromLinkStatus, determineInterfaceStatus } from '../utils/linkStatusUtils';
import { migrateDeviceToInterfaces, migrateConnectionToInterfaceIds } from '../utils/migrationUtils';
import { StructuredAnnotation, FreehandDrawing, DrawingTool } from '../types/annotation';

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
  reactFlowInstance: any | null;
  
  // Annotations
  annotations: StructuredAnnotation[];
  selectedAnnotation: StructuredAnnotation | null;
  showAnnotations: boolean;
  
  // Drawings
  drawings: FreehandDrawing[];
  selectedDrawing: FreehandDrawing | null;
  isDrawingMode: boolean;
  drawingTool: DrawingTool | null;
  currentDrawing: FreehandDrawing | null;
  showDrawings: boolean;
  drawingStyle: Partial<{ stroke: string; strokeWidth: number; strokeOpacity: number }> | null;
  
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
  
  // React Flow instance
  setReactFlowInstance: (instance: any) => void;
  
  // Annotation actions
  addAnnotation: (annotation: Omit<StructuredAnnotation, 'id'>) => void;
  updateAnnotation: (id: string, annotation: Partial<StructuredAnnotation>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (annotation: StructuredAnnotation | null) => void;
  toggleAnnotations: () => void;
  
  // Drawing actions
  startDrawing: (tool: DrawingTool, point: { x: number; y: number }) => void;
  addDrawingPoint: (point: { x: number; y: number }) => void;
  finishDrawing: () => void;
  deleteDrawing: (id: string) => void;
  selectDrawing: (drawing: FreehandDrawing | null) => void;
  clearDrawings: () => void;
  toggleDrawingMode: () => void;
  setDrawingTool: (tool: DrawingTool | null) => void;
  toggleDrawings: () => void;
  setDrawingStyle: (style: Partial<{ stroke: string; strokeWidth: number; strokeOpacity: number }>) => void;
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
  reactFlowInstance: null,
  
  // Annotation state
  annotations: [],
  selectedAnnotation: null,
  showAnnotations: true,
  
  // Drawing state
  drawings: [],
  selectedDrawing: null,
  isDrawingMode: false,
  drawingTool: null,
  currentDrawing: null,
  showDrawings: true,
  drawingStyle: null,
  
  addDevice: (device) => set((state) => {
    const newDevice: NetworkDevice = {
      ...device,
      id: generateId('device'),
      interfaces: device.interfaces || []
    };
    const newDevices = [...state.devices, newDevice];
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
    // Find source and target devices
    let sourceDevice = state.devices.find(d => d.id === connection.source);
    let targetDevice = state.devices.find(d => d.id === connection.target);
    
    // Don't auto-select interfaces - default to None
    let sourceInterfaceId = connection.sourceInterfaceId;
    let targetInterfaceId = connection.targetInterfaceId;
    let connectionType = connection.type || 'ethernet';
    
    let updatedDevices = [...state.devices];
    let connectionStyle = connection.style || {
      strokeStyle: 'solid',
      strokeColor: '#1976d2',
      strokeWidth: 2,
      animated: false
    };
    
    // If both interfaces are selected, update their status and connection style
    if (sourceInterfaceId && targetInterfaceId && sourceDevice && targetDevice) {
      const sourceInterface = sourceDevice.interfaces?.find(i => i.id === sourceInterfaceId);
      const targetInterface = targetDevice.interfaces?.find(i => i.id === targetInterfaceId);
      
      if (sourceInterface && targetInterface) {
        // Set connection type based on interfaces
        if (sourceInterface.type === targetInterface.type) {
          connectionType = sourceInterface.type;
        }
        
        // Determine interface statuses
        const sourceStatus = determineInterfaceStatus(sourceInterface, targetInterface, true);
        const targetStatus = determineInterfaceStatus(targetInterface, sourceInterface, true);
        
        // Update devices with new interface statuses (if not admin-down)
        updatedDevices = updatedDevices.map(device => {
          if (device.id === connection.source && sourceInterface.status !== 'admin-down') {
            return {
              ...device,
              interfaces: device.interfaces.map(intf =>
                intf.id === sourceInterfaceId ? { ...intf, status: sourceStatus } : intf
              )
            };
          } else if (device.id === connection.target && targetInterface.status !== 'admin-down') {
            return {
              ...device,
              interfaces: device.interfaces.map(intf =>
                intf.id === targetInterfaceId ? { ...intf, status: targetStatus } : intf
              )
            };
          }
          return device;
        });
        
        // Determine connection style based on link status
        const linkStatus = determineLinkStatus(
          { ...sourceInterface, status: sourceStatus },
          { ...targetInterface, status: targetStatus }
        );
        connectionStyle = getConnectionStyleFromLinkStatus(linkStatus, connectionStyle);
      }
    }
    
    const newConnection = { 
      ...connection, 
      id: generateId('conn'),
      sourceInterfaceId,
      targetInterfaceId,
      type: connectionType,
      style: connectionStyle
    };
    
    const newConnections = [...state.connections, newConnection];
    return {
      devices: updatedDevices,
      connections: newConnections,
      history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
    };
  }),
  
  updateConnection: (id, connection) => set((state) => {
    // Get the current connection to check for interface changes
    const currentConnection = state.connections.find(c => c.id === id);
    let updatedDevices = [...state.devices];
    
    if (currentConnection) {
      // Handle source interface change
      if (connection.sourceInterfaceId !== undefined && 
          connection.sourceInterfaceId !== currentConnection.sourceInterfaceId) {
        // Set old source interface to down
        if (currentConnection.sourceInterfaceId) {
          updatedDevices = updatedDevices.map(device => {
            if (device.id === currentConnection.source) {
              const updatedInterfaces = device.interfaces.map(intf => {
                if (intf.id === currentConnection.sourceInterfaceId && intf.status !== 'admin-down') {
                  return { ...intf, status: 'down' as const };
                }
                return intf;
              });
              return { ...device, interfaces: updatedInterfaces };
            }
            return device;
          });
        }
      }
      
      // Handle target interface change
      if (connection.targetInterfaceId !== undefined && 
          connection.targetInterfaceId !== currentConnection.targetInterfaceId) {
        // Set old target interface to down
        if (currentConnection.targetInterfaceId) {
          updatedDevices = updatedDevices.map(device => {
            if (device.id === currentConnection.target) {
              const updatedInterfaces = device.interfaces.map(intf => {
                if (intf.id === currentConnection.targetInterfaceId && intf.status !== 'admin-down') {
                  return { ...intf, status: 'down' as const };
                }
                return intf;
              });
              return { ...device, interfaces: updatedInterfaces };
            }
            return device;
          });
        }
      }
    }
    
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
      devices: updatedDevices,
      connections: updatedConnections,
      selectedConnection: updatedSelectedConnection
    };
  }),
  
  deleteConnection: (id) => set((state) => {
    // 削除する接続を取得
    const connectionToDelete = state.connections.find(c => c.id === id);
    
    if (connectionToDelete) {
      // 接続されているインターフェースのステータスをDownに戻す（Admin Downでない限り）
      const updatedDevices = state.devices.map(device => {
        // ソースデバイスの場合
        if (device.id === connectionToDelete.source && connectionToDelete.sourceInterfaceId) {
          const updatedInterfaces = device.interfaces.map(intf => {
            if (intf.id === connectionToDelete.sourceInterfaceId && intf.status !== 'admin-down') {
              return { ...intf, status: 'down' as const };
            }
            return intf;
          });
          return { ...device, interfaces: updatedInterfaces };
        }
        
        // ターゲットデバイスの場合
        if (device.id === connectionToDelete.target && connectionToDelete.targetInterfaceId) {
          const updatedInterfaces = device.interfaces.map(intf => {
            if (intf.id === connectionToDelete.targetInterfaceId && intf.status !== 'admin-down') {
              return { ...intf, status: 'down' as const };
            }
            return intf;
          });
          return { ...device, interfaces: updatedInterfaces };
        }
        
        return device;
      });
      
      const newConnections = state.connections.filter((c) => c.id !== id);
      return {
        devices: updatedDevices,
        connections: newConnections,
        history: trimHistory(pushToHistory(state.history, state.devices, state.connections))
      };
    }
    
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
    annotations: [],
    selectedAnnotation: null,
    drawings: [],
    currentDrawing: null,
  }),
  
  loadDiagram: (diagram) => set((state) => {
    // Migrate devices to include interfaces
    const migratedDevices = diagram.devices.map(device => 
      device.interfaces && Array.isArray(device.interfaces) 
        ? device 
        : migrateDeviceToInterfaces(device)
    );
    
    // Migrate connections to use interface IDs
    const migratedConnections = diagram.connections.map(conn =>
      migrateConnectionToInterfaceIds(conn, migratedDevices)
    );
    
    return {
      currentDiagram: diagram,
      devices: migratedDevices,
      connections: migratedConnections,
      groups: diagram.groups || [],
      layer: diagram.layer,
      selectedDevice: null,
      selectedConnection: null,
      selectedDevices: [],
      selectedConnections: [],
      selectedGroup: null,
      annotations: diagram.annotations || [],
      selectedAnnotation: null,
      drawings: diagram.drawings || [],
      currentDrawing: null,
    };
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
        },
        // インターフェースをコピーし、接続情報をクリア
        interfaces: device.interfaces.map(intf => ({
          ...intf,
          id: generateId('intf'),
          connectedTo: undefined
        }))
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
  
  // React Flow instance
  setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
  
  // Annotation actions
  addAnnotation: (annotation) => set((state) => {
    const newAnnotation: StructuredAnnotation = {
      ...annotation,
      id: generateId('annotation'),
    };
    return {
      annotations: [...state.annotations, newAnnotation],
    };
  }),
  
  updateAnnotation: (id, annotation) => set((state) => ({
    annotations: state.annotations.map((a) => 
      a.id === id ? { ...a, ...annotation } : a
    ),
  })),
  
  deleteAnnotation: (id) => set((state) => ({
    annotations: state.annotations.filter((a) => a.id !== id),
    selectedAnnotation: state.selectedAnnotation?.id === id ? null : state.selectedAnnotation,
  })),
  
  selectAnnotation: (annotation) => set({ 
    selectedAnnotation: annotation,
    selectedDevice: null,
    selectedConnection: null,
  }),
  
  toggleAnnotations: () => set((state) => ({ 
    showAnnotations: !state.showAnnotations 
  })),
  
  // Drawing actions
  startDrawing: (tool, point) => set((state) => {
    const newDrawing: FreehandDrawing = {
      id: generateId('drawing'),
      type: tool === 'rectangle' ? 'rectangle' : tool === 'highlighter' ? 'highlighter' : 'pen',
      points: [point],
      style: {
        stroke: state.drawingStyle?.stroke || (tool === 'highlighter' ? '#ffeb3b' : '#000000'),
        strokeWidth: state.drawingStyle?.strokeWidth || (tool === 'highlighter' ? 15 : 2),
        strokeOpacity: state.drawingStyle?.strokeOpacity || (tool === 'highlighter' ? 0.3 : 1),
      },
    };
    return {
      currentDrawing: newDrawing,
      isDrawingMode: true,
      drawingTool: tool,
    };
  }),
  
  addDrawingPoint: (point) => set((state) => {
    if (!state.currentDrawing) return state;
    return {
      currentDrawing: {
        ...state.currentDrawing,
        points: [...state.currentDrawing.points, point],
      },
    };
  }),
  
  finishDrawing: () => set((state) => {
    if (!state.currentDrawing || state.currentDrawing.points.length < 2) {
      return { currentDrawing: null };
    }
    return {
      drawings: [...state.drawings, state.currentDrawing],
      currentDrawing: null,
    };
  }),
  
  deleteDrawing: (id) => set((state) => ({
    drawings: state.drawings.filter((d) => d.id !== id),
    selectedDrawing: state.selectedDrawing?.id === id ? null : state.selectedDrawing,
  })),
  
  selectDrawing: (drawing) => set({ 
    selectedDrawing: drawing,
    selectedAnnotation: null,
    selectedDevice: null,
    selectedConnection: null,
  }),
  
  clearDrawings: () => set({ drawings: [], selectedDrawing: null }),
  
  toggleDrawingMode: () => set((state) => ({ 
    isDrawingMode: !state.isDrawingMode,
    drawingTool: !state.isDrawingMode ? 'pen' : null,
  })),
  
  setDrawingTool: (tool) => set({ drawingTool: tool }),
  
  toggleDrawings: () => set((state) => ({ 
    showDrawings: !state.showDrawings 
  })),
  
  setDrawingStyle: (style) => set((state) => ({
    drawingStyle: { ...state.drawingStyle, ...style }
  })),
}));