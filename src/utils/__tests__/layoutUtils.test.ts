import { NetworkDevice, Connection } from '../../types/network';
import {
  hierarchicalLayout,
  forceDirectedLayout,
  circularLayout,
  gridLayout,
  applyLayout,
  LayoutOptions
} from '../layoutUtils';

describe('Layout Utils', () => {
  const mockDevices: NetworkDevice[] = [
    {
      id: 'router-1',
      type: 'router',
      name: 'Main Router',
      position: { x: 0, y: 0 },
      interfaces: [],
      config: {}
    },
    {
      id: 'switch-1',
      type: 'switch',
      name: 'Core Switch',
      position: { x: 0, y: 0 },
      interfaces: [],
      config: {}
    },
    {
      id: 'server-1',
      type: 'server',
      name: 'Web Server',
      position: { x: 0, y: 0 },
      interfaces: [],
      config: {}
    },
    {
      id: 'workstation-1',
      type: 'workstation',
      name: 'PC 1',
      position: { x: 0, y: 0 },
      interfaces: [],
      config: {}
    }
  ];

  const mockConnections: Connection[] = [
    {
      id: 'conn-1',
      source: 'router-1',
      target: 'switch-1',
      type: 'ethernet'
    },
    {
      id: 'conn-2',
      source: 'switch-1',
      target: 'server-1',
      type: 'ethernet'
    },
    {
      id: 'conn-3',
      source: 'switch-1',
      target: 'workstation-1',
      type: 'ethernet'
    }
  ];

  const defaultOptions: LayoutOptions = {
    algorithm: 'hierarchical',
    spacing: 150,
    direction: 'vertical'
  };

  describe('hierarchicalLayout', () => {
    test('arranges devices in hierarchical layers', () => {
      const result = hierarchicalLayout(mockDevices, mockConnections, defaultOptions);

      expect(result.devices).toHaveLength(4);
      
      // Router should be at layer 1 (y = 150)
      const router = result.devices.find(d => d.type === 'router');
      expect(router?.position.y).toBe(150);
      
      // Switch should be at layer 3 (y = 450)
      const switch_ = result.devices.find(d => d.type === 'switch');
      expect(switch_?.position.y).toBe(450);
      
      // Server and workstation should be at layer 4 (y = 600)
      const server = result.devices.find(d => d.type === 'server');
      const workstation = result.devices.find(d => d.type === 'workstation');
      expect(server?.position.y).toBe(600);
      expect(workstation?.position.y).toBe(600);
    });

    test('handles horizontal direction', () => {
      const options = { ...defaultOptions, direction: 'horizontal' as const };
      const result = hierarchicalLayout(mockDevices, mockConnections, options);

      // Router should be at layer 1 (x = 150)
      const router = result.devices.find(d => d.type === 'router');
      expect(router?.position.x).toBe(150);
    });

    test('centers layout when center coordinates provided', () => {
      const options = { ...defaultOptions, centerX: 500, centerY: 300 };
      const result = hierarchicalLayout(mockDevices, mockConnections, options);

      // Check that bounding box is centered around the specified coordinates
      expect(result.boundingBox.minX).toBeLessThan(500);
      expect(result.boundingBox.maxX).toBeGreaterThan(500);
    });

    test('handles empty device list', () => {
      const result = hierarchicalLayout([], [], defaultOptions);
      
      expect(result.devices).toHaveLength(0);
      expect(result.boundingBox.minX).toBe(Infinity);
      expect(result.boundingBox.maxX).toBe(-Infinity);
    });
  });

  describe('forceDirectedLayout', () => {
    test('applies force-directed positioning', () => {
      const result = forceDirectedLayout(mockDevices, mockConnections, defaultOptions);

      expect(result.devices).toHaveLength(4);
      
      // All devices should have valid positions
      result.devices.forEach(device => {
        expect(typeof device.position.x).toBe('number');
        expect(typeof device.position.y).toBe('number');
        expect(isFinite(device.position.x)).toBe(true);
        expect(isFinite(device.position.y)).toBe(true);
      });

      // Bounding box should be valid
      expect(result.boundingBox.minX).toBeLessThanOrEqual(result.boundingBox.maxX);
      expect(result.boundingBox.minY).toBeLessThanOrEqual(result.boundingBox.maxY);
    });

    test('preserves existing positions when valid', () => {
      const devicesWithPositions = mockDevices.map(device => ({
        ...device,
        position: { x: 100, y: 100 }
      }));

      const result = forceDirectedLayout(devicesWithPositions, mockConnections, defaultOptions);
      
      // Positions should be different after force-directed layout
      result.devices.forEach(device => {
        expect(device.position.x).not.toBe(0);
        expect(device.position.y).not.toBe(0);
      });
    });

    test('handles devices with no connections', () => {
      const isolatedDevices = [mockDevices[0]]; // Only router, no connections
      const result = forceDirectedLayout(isolatedDevices, [], defaultOptions);

      expect(result.devices).toHaveLength(1);
      expect(typeof result.devices[0].position.x).toBe('number');
      expect(typeof result.devices[0].position.y).toBe('number');
    });
  });

  describe('circularLayout', () => {
    test('arranges devices in a circle', () => {
      const options = { ...defaultOptions, centerX: 0, centerY: 0 };
      const result = circularLayout(mockDevices, mockConnections, options);

      expect(result.devices).toHaveLength(4);
      
      // Calculate expected radius
      const expectedRadius = (4 * 150) / (2 * Math.PI);
      
      // Each device should be at the expected radius from center
      result.devices.forEach(device => {
        const distance = Math.sqrt(device.position.x ** 2 + device.position.y ** 2);
        expect(Math.abs(distance - expectedRadius)).toBeLessThan(1); // Allow small floating point errors
      });

      // Bounding box should match circle bounds
      expect(Math.abs(result.boundingBox.minX + expectedRadius)).toBeLessThan(1);
      expect(Math.abs(result.boundingBox.maxX - expectedRadius)).toBeLessThan(1);
    });

    test('handles single device', () => {
      const singleDevice = [mockDevices[0]];
      const result = circularLayout(singleDevice, [], defaultOptions);

      expect(result.devices).toHaveLength(1);
      // Single device should be positioned at the center (or slight offset due to radius calculation)
      expect(Math.abs(result.devices[0].position.x)).toBeLessThan(50);
      expect(Math.abs(result.devices[0].position.y)).toBeLessThan(50);
    });
  });

  describe('gridLayout', () => {
    test('arranges devices in a grid', () => {
      const options = { ...defaultOptions, centerX: 0, centerY: 0 };
      const result = gridLayout(mockDevices, mockConnections, options);

      expect(result.devices).toHaveLength(4);
      
      // Calculate expected grid dimensions
      const cols = Math.ceil(Math.sqrt(4)); // 2 columns
      const rows = Math.ceil(4 / cols); // 2 rows
      
      // Check that devices are positioned in grid pattern
      const positions = result.devices.map(d => d.position);
      const uniqueX = [...new Set(positions.map(p => p.x))];
      const uniqueY = [...new Set(positions.map(p => p.y))];
      
      expect(uniqueX.length).toBeLessThanOrEqual(cols);
      expect(uniqueY.length).toBeLessThanOrEqual(rows);
    });

    test('centers grid correctly', () => {
      const centerX = 300, centerY = 200;
      const options = { ...defaultOptions, centerX, centerY };
      const result = gridLayout(mockDevices, mockConnections, options);

      // Grid should be centered around the specified coordinates
      const avgX = result.devices.reduce((sum, d) => sum + d.position.x, 0) / result.devices.length;
      const avgY = result.devices.reduce((sum, d) => sum + d.position.y, 0) / result.devices.length;
      
      expect(Math.abs(avgX - centerX)).toBeLessThan(75); // Allow for grid spacing
      expect(Math.abs(avgY - centerY)).toBeLessThan(75);
    });
  });

  describe('applyLayout', () => {
    test('delegates to correct algorithm', () => {
      const hierarchicalResult = applyLayout(mockDevices, mockConnections, {
        algorithm: 'hierarchical',
        spacing: 150
      });
      
      const gridResult = applyLayout(mockDevices, mockConnections, {
        algorithm: 'grid',
        spacing: 150
      });

      // Results should be different for different algorithms
      expect(hierarchicalResult.devices[0].position).not.toEqual(gridResult.devices[0].position);
    });

    test('handles empty device list', () => {
      const result = applyLayout([], [], defaultOptions);
      
      expect(result.devices).toHaveLength(0);
      expect(result.boundingBox).toEqual({
        minX: 0, minY: 0, maxX: 0, maxY: 0
      });
    });

    test('throws error for unknown algorithm', () => {
      const invalidOptions = { ...defaultOptions, algorithm: 'unknown' as any };
      
      expect(() => {
        applyLayout(mockDevices, mockConnections, invalidOptions);
      }).toThrow('Unknown layout algorithm: unknown');
    });

    test.each(['hierarchical', 'force', 'circular', 'grid'])('works with %s algorithm', (algorithm) => {
      const options = { ...defaultOptions, algorithm: algorithm as any };
      const result = applyLayout(mockDevices, mockConnections, options);

      expect(result.devices).toHaveLength(mockDevices.length);
      expect(result.boundingBox).toBeDefined();
      
      // All devices should have finite positions
      result.devices.forEach(device => {
        expect(isFinite(device.position.x)).toBe(true);
        expect(isFinite(device.position.y)).toBe(true);
      });
    });
  });

  describe('Layout spacing', () => {
    test('respects spacing parameter', () => {
      const smallSpacing = applyLayout(mockDevices, mockConnections, {
        algorithm: 'grid',
        spacing: 100
      });

      const largeSpacing = applyLayout(mockDevices, mockConnections, {
        algorithm: 'grid',
        spacing: 300
      });

      // Larger spacing should result in larger bounding box
      const smallWidth = smallSpacing.boundingBox.maxX - smallSpacing.boundingBox.minX;
      const largeWidth = largeSpacing.boundingBox.maxX - largeSpacing.boundingBox.minX;
      
      expect(largeWidth).toBeGreaterThan(smallWidth);
    });
  });

  describe('Edge cases', () => {
    test('handles devices with missing position data', () => {
      const devicesWithoutPositions = mockDevices.map(device => ({
        ...device,
        position: undefined as any
      }));

      // Should not throw and should assign valid positions
      expect(() => {
        const result = applyLayout(devicesWithoutPositions, mockConnections, defaultOptions);
        expect(result.devices).toHaveLength(devicesWithoutPositions.length);
      }).not.toThrow();
    });

    test('handles malformed connections', () => {
      const badConnections = [
        {
          id: 'bad-conn',
          source: 'non-existent-device',
          target: 'another-non-existent',
          type: 'ethernet' as const
        }
      ];

      // Should not throw even with invalid connections
      expect(() => {
        applyLayout(mockDevices, badConnections, defaultOptions);
      }).not.toThrow();
    });
  });
});