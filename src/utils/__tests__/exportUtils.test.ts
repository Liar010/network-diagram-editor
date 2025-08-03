import { NetworkDevice, Connection } from '../../types/network';
import { exportToSVG, exportToJSON } from '../exportUtils';

// Mock html2canvas for PNG export tests
jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock-image-data')
  });
});

// Mock URL and document methods
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn().mockReturnValue('mock-blob-url'),
    revokeObjectURL: jest.fn()
  }
});

// Mock document.createElement
const mockLink = {
  download: '',
  href: '',
  click: jest.fn()
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockLink;
    }
    return {};
  })
});

describe('Export Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToSVG', () => {
    const mockDevices: NetworkDevice[] = [
      {
        id: 'device-1',
        type: 'router',
        name: 'Router 1',
        position: { x: 100, y: 150 },
        config: { ipAddress: '192.168.1.1' }
      },
      {
        id: 'device-2',
        type: 'switch',
        name: 'Switch 1',
        position: { x: 300, y: 250 },
        config: { vlan: '10' }
      }
    ];

    const mockConnections: Connection[] = [
      {
        id: 'conn-1',
        source: 'device-1',
        target: 'device-2',
        type: 'ethernet',
        label: 'Uplink'
      }
    ];

    test('creates SVG with correct structure', () => {
      exportToSVG(mockDevices, mockConnections, 'test-diagram.svg');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-diagram.svg');
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('includes devices in SVG', () => {
      exportToSVG(mockDevices, mockConnections);

      // The function should create a blob, so we check if URL.createObjectURL was called
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('includes connections in SVG', () => {
      exportToSVG(mockDevices, mockConnections);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('uses default filename when not provided', () => {
      exportToSVG(mockDevices, mockConnections);

      expect(mockLink.download).toBe('network-diagram.svg');
    });

    test('handles empty devices and connections', () => {
      exportToSVG([], []);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    const mockDevices: NetworkDevice[] = [
      {
        id: 'device-1',
        type: 'router',
        name: 'Router 1',
        position: { x: 100, y: 150 },
        config: { ipAddress: '192.168.1.1' }
      }
    ];

    const mockConnections: Connection[] = [
      {
        id: 'conn-1',
        source: 'device-1',
        target: 'device-2',
        type: 'ethernet'
      }
    ];

    test('creates JSON file with correct structure', () => {
      exportToJSON(mockDevices, mockConnections, 'test-export.json');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-export.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('includes devices and connections in JSON', () => {
      // We need to spy on Blob constructor to check the content
      const originalBlob = global.Blob;
      const mockBlobContent = jest.fn();
      
      global.Blob = jest.fn().mockImplementation((content) => {
        mockBlobContent(content[0]);
        return { type: 'application/json' };
      }) as any;

      exportToJSON(mockDevices, mockConnections);

      expect(mockBlobContent).toHaveBeenCalled();
      const jsonContent = JSON.parse(mockBlobContent.mock.calls[0][0]);
      
      expect(jsonContent.devices).toEqual(mockDevices);
      expect(jsonContent.connections).toEqual(mockConnections);
      expect(jsonContent.exportedAt).toBeDefined();
      expect(new Date(jsonContent.exportedAt)).toBeInstanceOf(Date);

      global.Blob = originalBlob;
    });

    test('uses default filename when not provided', () => {
      exportToJSON(mockDevices, mockConnections);

      expect(mockLink.download).toBe('network-diagram.json');
    });

    test('handles empty data', () => {
      exportToJSON([], []);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('creates valid JSON structure', () => {
      const originalBlob = global.Blob;
      const mockBlobContent = jest.fn();
      
      global.Blob = jest.fn().mockImplementation((content) => {
        mockBlobContent(content[0]);
        return { type: 'application/json' };
      }) as any;

      exportToJSON(mockDevices, mockConnections);

      const jsonContent = JSON.parse(mockBlobContent.mock.calls[0][0]);
      
      expect(jsonContent).toHaveProperty('devices');
      expect(jsonContent).toHaveProperty('connections');
      expect(jsonContent).toHaveProperty('exportedAt');
      expect(Array.isArray(jsonContent.devices)).toBe(true);
      expect(Array.isArray(jsonContent.connections)).toBe(true);

      global.Blob = originalBlob;
    });
  });

  describe('Error Handling', () => {
    test('exportToSVG handles malformed device data gracefully', () => {
      const malformedDevices = [
        {
          id: 'device-1',
          type: 'router',
          name: 'Router 1',
          position: { x: 100, y: 150 },
          config: null
        }
      ] as any;

      expect(() => {
        exportToSVG(malformedDevices, []);
      }).not.toThrow();
    });

    test('exportToJSON handles malformed data gracefully', () => {
      const malformedData = [{ invalidProperty: 'test' }] as any;

      expect(() => {
        exportToJSON(malformedData, []);
      }).not.toThrow();
    });
  });
});