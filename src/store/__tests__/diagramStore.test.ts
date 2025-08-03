import { act, renderHook } from '@testing-library/react';
import { useDiagramStore } from '../diagramStore';

describe('DiagramStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useDiagramStore.getState().clearDiagram();
    });
  });

  describe('Device Management', () => {
    test('should add device correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const newDevice = {
        type: 'router' as const,
        name: 'Test Router',
        position: { x: 100, y: 100 },
        config: { ipAddress: '192.168.1.1' }
      };

      act(() => {
        result.current.addDevice(newDevice);
      });

      expect(result.current.devices).toHaveLength(1);
      expect(result.current.devices[0]).toMatchObject(newDevice);
      expect(result.current.devices[0].id).toBeDefined();
    });

    test('should update device correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const device = {
        type: 'router' as const,
        name: 'Test Router',
        position: { x: 100, y: 100 },
        config: {}
      };

      act(() => {
        result.current.addDevice(device);
      });

      const deviceId = result.current.devices[0].id;

      act(() => {
        result.current.updateDevice(deviceId, {
          name: 'Updated Router',
          config: { ipAddress: '192.168.1.1' }
        });
      });

      expect(result.current.devices[0].name).toBe('Updated Router');
      expect(result.current.devices[0].config.ipAddress).toBe('192.168.1.1');
    });

    test('should delete device and its connections', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add two devices
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Router 1',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.addDevice({
          type: 'switch' as const,
          name: 'Switch 1',
          position: { x: 200, y: 200 },
          config: {}
        });
      });

      const device1Id = result.current.devices[0].id;
      const device2Id = result.current.devices[1].id;

      // Add connection between devices
      act(() => {
        result.current.addConnection({
          source: device1Id,
          target: device2Id,
          type: 'ethernet'
        });
      });

      expect(result.current.connections).toHaveLength(1);

      // Delete first device
      act(() => {
        result.current.deleteDevice(device1Id);
      });

      expect(result.current.devices).toHaveLength(1);
      expect(result.current.connections).toHaveLength(0); // Connection should be removed
    });

    test('should select and deselect devices', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const device = {
        type: 'router' as const,
        name: 'Test Router',
        position: { x: 100, y: 100 },
        config: {}
      };

      act(() => {
        result.current.addDevice(device);
      });

      const addedDevice = result.current.devices[0];

      act(() => {
        result.current.selectDevice(addedDevice);
      });

      expect(result.current.selectedDevice).toEqual(addedDevice);

      act(() => {
        result.current.selectDevice(null);
      });

      expect(result.current.selectedDevice).toBeNull();
    });
  });

  describe('Connection Management', () => {
    test('should add connection correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add two devices first
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Router 1',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.addDevice({
          type: 'switch' as const,
          name: 'Switch 1',
          position: { x: 200, y: 200 },
          config: {}
        });
      });

      const device1Id = result.current.devices[0].id;
      const device2Id = result.current.devices[1].id;

      const connection = {
        source: device1Id,
        target: device2Id,
        type: 'ethernet' as const,
        label: 'Test Connection'
      };

      act(() => {
        result.current.addConnection(connection);
      });

      expect(result.current.connections).toHaveLength(1);
      expect(result.current.connections[0]).toMatchObject(connection);
      expect(result.current.connections[0].id).toBeDefined();
    });

    test('should update connection correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Setup devices and connection
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Router 1',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.addDevice({
          type: 'switch' as const,
          name: 'Switch 1',
          position: { x: 200, y: 200 },
          config: {}
        });
      });

      const device1Id = result.current.devices[0].id;
      const device2Id = result.current.devices[1].id;

      act(() => {
        result.current.addConnection({
          source: device1Id,
          target: device2Id,
          type: 'ethernet'
        });
      });

      const connectionId = result.current.connections[0].id;

      act(() => {
        result.current.updateConnection(connectionId, {
          label: 'Updated Connection',
          type: 'fiber'
        });
      });

      expect(result.current.connections[0].label).toBe('Updated Connection');
      expect(result.current.connections[0].type).toBe('fiber');
    });

    test('should delete connection correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Setup devices and connection
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Router 1',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.addDevice({
          type: 'switch' as const,
          name: 'Switch 1',
          position: { x: 200, y: 200 },
          config: {}
        });
      });

      const device1Id = result.current.devices[0].id;
      const device2Id = result.current.devices[1].id;

      act(() => {
        result.current.addConnection({
          source: device1Id,
          target: device2Id,
          type: 'ethernet'
        });
      });

      const connectionId = result.current.connections[0].id;

      act(() => {
        result.current.deleteConnection(connectionId);
      });

      expect(result.current.connections).toHaveLength(0);
    });
  });

  describe('Layer Management', () => {
    test('should set layer correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      expect(result.current.layer).toBe('L3'); // Default layer

      act(() => {
        result.current.setLayer('L1');
      });

      expect(result.current.layer).toBe('L1');

      act(() => {
        result.current.setLayer('L2');
      });

      expect(result.current.layer).toBe('L2');
    });
  });

  describe('Diagram Management', () => {
    test('should clear diagram correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add some data
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Test Router',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.selectDevice(result.current.devices[0]);
      });

      act(() => {
        result.current.clearDiagram();
      });

      expect(result.current.devices).toHaveLength(0);
      expect(result.current.connections).toHaveLength(0);
      expect(result.current.selectedDevice).toBeNull();
      expect(result.current.selectedConnection).toBeNull();
    });

    test('should load diagram correctly', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      const mockDiagram = {
        id: 'test-diagram',
        name: 'Test Diagram',
        devices: [
          {
            id: 'device-1',
            type: 'router' as const,
            name: 'Test Router',
            position: { x: 100, y: 100 },
            config: { ipAddress: '192.168.1.1' }
          }
        ],
        connections: [
          {
            id: 'conn-1',
            source: 'device-1',
            target: 'device-2',
            type: 'ethernet' as const
          }
        ],
        groups: [],
        layer: 'L2' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      act(() => {
        result.current.loadDiagram(mockDiagram);
      });

      expect(result.current.currentDiagram).toEqual(mockDiagram);
      expect(result.current.devices).toEqual(mockDiagram.devices);
      expect(result.current.connections).toEqual(mockDiagram.connections);
      expect(result.current.layer).toBe('L2');
      expect(result.current.selectedDevice).toBeNull();
      expect(result.current.selectedConnection).toBeNull();
    });
  });

  describe('Selection Management', () => {
    test('should handle mutual exclusion between device and connection selection', () => {
      const { result } = renderHook(() => useDiagramStore());
      
      // Add device and connection
      act(() => {
        result.current.addDevice({
          type: 'router' as const,
          name: 'Router 1',
          position: { x: 100, y: 100 },
          config: {}
        });
        result.current.addDevice({
          type: 'switch' as const,
          name: 'Switch 1',
          position: { x: 200, y: 200 },
          config: {}
        });
      });

      const device1Id = result.current.devices[0].id;
      const device2Id = result.current.devices[1].id;

      act(() => {
        result.current.addConnection({
          source: device1Id,
          target: device2Id,
          type: 'ethernet'
        });
      });

      const device = result.current.devices[0];
      const connection = result.current.connections[0];

      // Select device first
      act(() => {
        result.current.selectDevice(device);
      });

      expect(result.current.selectedDevice).toEqual(device);
      expect(result.current.selectedConnection).toBeNull();

      // Select connection - should deselect device
      act(() => {
        result.current.selectConnection(connection);
      });

      expect(result.current.selectedDevice).toBeNull();
      expect(result.current.selectedConnection).toEqual(connection);
    });
  });
});