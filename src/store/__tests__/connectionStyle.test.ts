import { renderHook, act } from '@testing-library/react';
import { Connection, ConnectionStyle } from '../../types/network';
import { useDiagramStore } from '../diagramStore';

describe('Connection Style Tests', () => {
  beforeEach(() => {
    act(() => {
      useDiagramStore.getState().clearDiagram();
    });
  });

  describe('Connection Style Management', () => {
    it('should add connection with default style', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
        });
      });

      const connection = result.current.connections[0];
      expect(connection.style).toEqual({
        strokeStyle: 'solid',
        strokeColor: '#1976d2',
        strokeWidth: 2,
        animated: false,
      });
    });

    it('should add connection with custom style', () => {
      const { result } = renderHook(() => useDiagramStore());
      const customStyle: ConnectionStyle = {
        strokeStyle: 'dashed',
        strokeColor: '#ff0000',
        strokeWidth: 4,
        animated: true,
      };

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
          style: customStyle,
        });
      });

      const connection = result.current.connections[0];
      expect(connection.style).toEqual(customStyle);
    });

    it('should update connection style properties individually', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
        });
      });

      const connectionId = result.current.connections[0].id;

      // Update stroke style
      act(() => {
        result.current.updateConnection(connectionId, {
          style: {
            strokeStyle: 'dashed',
            strokeColor: '#1976d2',
            strokeWidth: 2,
            animated: false,
          },
        });
      });

      let connection = result.current.connections[0];
      expect(connection.style?.strokeStyle).toBe('dashed');
      expect(connection.style?.strokeColor).toBe('#1976d2');

      // Update color
      act(() => {
        result.current.updateConnection(connectionId, {
          style: {
            strokeStyle: 'dashed',
            strokeColor: '#00ff00',
            strokeWidth: 2,
            animated: false,
          },
        });
      });

      connection = result.current.connections[0];
      expect(connection.style?.strokeColor).toBe('#00ff00');
      expect(connection.style?.strokeStyle).toBe('dashed'); // Should be preserved

      // Update width
      act(() => {
        result.current.updateConnection(connectionId, {
          style: {
            strokeStyle: 'dashed',
            strokeColor: '#00ff00',
            strokeWidth: 5,
            animated: false,
          },
        });
      });

      connection = result.current.connections[0];
      expect(connection.style?.strokeWidth).toBe(5);
      expect(connection.style?.strokeColor).toBe('#00ff00'); // Should be preserved

      // Update animation
      act(() => {
        result.current.updateConnection(connectionId, {
          style: {
            strokeStyle: 'dashed',
            strokeColor: '#00ff00',
            strokeWidth: 5,
            animated: true,
          },
        });
      });

      connection = result.current.connections[0];
      expect(connection.style?.animated).toBe(true);
      expect(connection.style?.strokeWidth).toBe(5); // Should be preserved
    });

    it('should update connection labels and ports', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
        });
      });

      const connectionId = result.current.connections[0].id;

      act(() => {
        result.current.updateConnection(connectionId, {
          label: 'Main Link',
          sourcePort: 'Gi0/1',
          targetPort: 'Gi0/2',
          bandwidth: '10 Gbps',
        });
      });

      const connection = result.current.connections[0];
      expect(connection.label).toBe('Main Link');
      expect(connection.sourcePort).toBe('Gi0/1');
      expect(connection.targetPort).toBe('Gi0/2');
      expect(connection.bandwidth).toBe('10 Gbps');
    });

    it('should update selectedConnection when updating the selected connection', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
        });
      });

      const connection = result.current.connections[0];

      act(() => {
        result.current.selectConnection(connection);
      });

      expect(result.current.selectedConnection?.id).toBe(connection.id);

      act(() => {
        result.current.updateConnection(connection.id, {
          label: 'Updated Label',
        });
      });

      expect(result.current.selectedConnection?.label).toBe('Updated Label');
    });

    it('should handle partial style updates correctly', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
          style: {
            strokeStyle: 'dotted',
            strokeColor: '#ff00ff',
            strokeWidth: 3,
            animated: true,
          },
        });
      });

      const connectionId = result.current.connections[0].id;

      // Update only strokeStyle
      act(() => {
        result.current.updateConnection(connectionId, {
          style: {
            strokeStyle: 'solid',
            strokeColor: '#ff00ff',
            strokeWidth: 3,
            animated: true,
          },
        });
      });

      const connection = result.current.connections[0];
      expect(connection.style).toEqual({
        strokeStyle: 'solid',
        strokeColor: '#ff00ff',
        strokeWidth: 3,
        animated: true,
      });
    });
  });

  describe('Connection Selection', () => {
    it('should select connection and deselect device', () => {
      const { result } = renderHook(() => useDiagramStore());

      act(() => {
        result.current.addDevice({
          type: 'router',
          name: 'Router1',
          position: { x: 0, y: 0 },
          config: {},
        });
        result.current.addConnection({
          source: 'device1',
          target: 'device2',
          type: 'ethernet',
        });
      });

      const device = result.current.devices[0];
      const connection = result.current.connections[0];

      act(() => {
        result.current.selectDevice(device);
      });

      expect(result.current.selectedDevice?.id).toBe(device.id);
      expect(result.current.selectedConnection).toBeNull();

      act(() => {
        result.current.selectConnection(connection);
      });

      expect(result.current.selectedConnection?.id).toBe(connection.id);
      expect(result.current.selectedDevice).toBeNull();
    });
  });
});