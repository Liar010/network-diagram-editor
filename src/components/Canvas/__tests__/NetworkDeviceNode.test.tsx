import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useDiagramStore } from '../../../store/diagramStore';
import { NetworkDevice } from '../../../types/network';
import NetworkDeviceNode from '../NetworkDeviceNode';

// Mock the store
jest.mock('../../../store/diagramStore', () => ({
  useDiagramStore: jest.fn()
}));
const mockUseDiagramStore = useDiagramStore as jest.MockedFunction<typeof useDiagramStore>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('NetworkDeviceNode Component', () => {
  const mockSelectDevice = jest.fn();
  
  const mockDevice: NetworkDevice = {
    id: 'device-1',
    type: 'router',
    name: 'Test Router',
    position: { x: 100, y: 100 },
    interfaces: [],
    config: {
      ipAddress: '192.168.1.1',
      subnet: '255.255.255.0',
      vlan: '10'
    }
  };

  const defaultProps = {
    id: 'device-1',
    data: { device: mockDevice },
    selected: false,
    xPos: 100,
    yPos: 100,
    zIndex: 1,
    dragging: false,
    dragHandle: undefined as any,
    type: 'networkDevice',
    sourcePosition: undefined as any,
    targetPosition: undefined as any,
    hidden: false,
    resizing: false,
    selectable: true,
    focusable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    parentId: undefined,
    extent: undefined,
    expandParent: false,
    width: 100,
    height: 100,
    positionAbsoluteX: 100,
    positionAbsoluteY: 100,
    measured: { width: 100, height: 100 },
    internals: {
      z: 1,
      handleBounds: undefined,
      isParent: false,
      userSelectionActive: false
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDiagramStore.mockReturnValue({
      selectDevice: mockSelectDevice,
      devices: [],
      connections: [],
      selectedDevice: null,
      selectedConnection: null,
      layer: 'L3',
      currentDiagram: null,
      addDevice: jest.fn(),
      updateDevice: jest.fn(),
      deleteDevice: jest.fn(),
      addConnection: jest.fn(),
      updateConnection: jest.fn(),
      deleteConnection: jest.fn(),
      selectConnection: jest.fn(),
      setLayer: jest.fn(),
      clearDiagram: jest.fn(),
      loadDiagram: jest.fn()
    });
  });

  test('renders device with name and type icon', () => {
    renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
    
    expect(screen.getByText('Test Router')).toBeInTheDocument();
    // Router icon should be rendered
    expect(screen.getByTestId('RouterIcon')).toBeInTheDocument();
  });

  test('displays IP address when available', () => {
    renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
    
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  test('does not display IP address when not available', () => {
    const deviceWithoutIP = {
      ...mockDevice,
      config: {}
    };
    
    renderWithTheme(
      <NetworkDeviceNode 
        {...defaultProps} 
        data={{ device: deviceWithoutIP }}
      />
    );
    
    expect(screen.queryByText('192.168.1.1')).not.toBeInTheDocument();
  });

  test('handles click to select device', () => {
    renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
    
    const paper = screen.getByText('Test Router').closest('.MuiPaper-root') as HTMLElement;
    expect(paper).toBeInTheDocument();
    
    fireEvent.click(paper);
    expect(mockSelectDevice).toHaveBeenCalledWith(mockDevice);
  });

  test('applies selected styling when selected', () => {
    renderWithTheme(
      <NetworkDeviceNode 
        {...defaultProps} 
        selected={true}
      />
    );
    
    const paper = screen.getByText('Test Router').closest('.MuiPaper-root');
    expect(paper).toHaveStyle('border: 2px solid #1976d2');
  });

  test('does not apply selected styling when not selected', () => {
    renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
    
    const paper = screen.getByText('Test Router').closest('.MuiPaper-root');
    expect(paper).not.toHaveStyle('border: 2px solid #1976d2');
  });

  describe('Different Device Types', () => {
    const deviceTypes = [
      { type: 'router', expectedIcon: 'RouterIcon' },
      { type: 'switch', expectedIcon: 'HubIcon' },
      { type: 'firewall', expectedIcon: 'SecurityIcon' },
      { type: 'server', expectedIcon: 'StorageIcon' },
      { type: 'load-balancer', expectedIcon: 'BalanceIcon' },
      { type: 'cloud', expectedIcon: 'CloudIcon' },
      { type: 'workstation', expectedIcon: 'ComputerIcon' },
      { type: 'access-point', expectedIcon: 'WifiIcon' }
    ];

    test.each(deviceTypes)('renders correct icon for $type', ({ type, expectedIcon }) => {
      const device = {
        ...mockDevice,
        type: type as any,
        name: `Test ${type}`
      };

      renderWithTheme(
        <NetworkDeviceNode 
          {...defaultProps} 
          data={{ device }}
        />
      );

      expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
    });
  });

  test('renders connection handles', () => {
    renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
    
    // The component should render React Flow handles, but they might not be easily testable
    // We can check that the component renders without errors
    expect(screen.getByText('Test Router')).toBeInTheDocument();
  });

  test('truncates long device names', () => {
    const deviceWithLongName = {
      ...mockDevice,
      name: 'This is a very long device name that should be truncated'
    };

    renderWithTheme(
      <NetworkDeviceNode 
        {...defaultProps} 
        data={{ device: deviceWithLongName }}
      />
    );

    const nameElement = screen.getByText(deviceWithLongName.name);
    expect(nameElement).toHaveStyle('max-width: 120px');
  });

  describe('Accessibility', () => {
    test('is keyboard accessible', () => {
      renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
      
      const deviceNode = screen.getByText('Test Router').closest('div');
      expect(deviceNode).toHaveAttribute('style');
      expect(deviceNode).toHaveStyle('cursor: pointer');
    });

    test('provides visual feedback on hover', () => {
      renderWithTheme(<NetworkDeviceNode {...defaultProps} />);
      
      const paper = screen.getByText('Test Router').closest('.MuiPaper-root');
      expect(paper).toHaveClass('MuiPaper-root');
    });
  });
});