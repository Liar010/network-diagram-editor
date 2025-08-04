import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import React from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { NetworkDevice, Connection } from '../../types/network';
import Properties from './Properties';

// Mock the store
jest.mock('../../store/diagramStore');

const mockUseDiagramStore = useDiagramStore as jest.MockedFunction<typeof useDiagramStore>;

describe('Connection Interface Selector', () => {
  const mockUpdateConnection = jest.fn();
  const mockSelectConnection = jest.fn();
  const mockDeleteConnection = jest.fn();
  
  const mockDevices: NetworkDevice[] = [
    {
      id: 'device1',
      type: 'router',
      name: 'Router 1',
      position: { x: 100, y: 100 },
      config: {},
      interfaces: [
        {
          id: 'if1',
          name: 'GigabitEthernet0/0',
          type: 'ethernet',
          status: 'up',
        },
        {
          id: 'if2',
          name: 'GigabitEthernet0/1',
          type: 'ethernet',
          status: 'down',
        },
      ],
    },
    {
      id: 'device2',
      type: 'switch',
      name: 'Switch 1',
      position: { x: 300, y: 100 },
      config: {},
      interfaces: [
        {
          id: 'if3',
          name: 'FastEthernet0/1',
          type: 'ethernet',
          status: 'up',
        },
        {
          id: 'if4',
          name: 'FastEthernet0/2',
          type: 'ethernet',
          status: 'up',
        },
      ],
    },
  ];
  
  const mockConnection: Connection = {
    id: 'conn1',
    source: 'device1',
    target: 'device2',
    type: 'ethernet',
    sourceInterfaceId: 'if1',
    targetInterfaceId: 'if3',
  };
  
  beforeEach(() => {
    mockUseDiagramStore.mockReturnValue({
      selectedDevice: null,
      selectedConnection: mockConnection,
      updateDevice: jest.fn(),
      updateConnection: mockUpdateConnection,
      selectDevice: jest.fn(),
      selectConnection: mockSelectConnection,
      deleteDevice: jest.fn(),
      deleteConnection: mockDeleteConnection,
      devices: mockDevices,
    });
    mockUpdateConnection.mockClear();
  });
  
  it('renders interface dropdowns for selected connection', () => {
    render(<Properties />);
    
    expect(screen.getByLabelText('Source Interface')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Interface')).toBeInTheDocument();
  });
  
  it('shows correct interfaces in source dropdown', async () => {
    render(<Properties />);
    
    const sourceSelect = screen.getByLabelText('Source Interface');
    fireEvent.mouseDown(sourceSelect);
    
    await screen.findByText('GigabitEthernet0/0');
    expect(screen.getByText('GigabitEthernet0/0')).toBeInTheDocument();
    expect(screen.getByText('GigabitEthernet0/1')).toBeInTheDocument();
    expect(screen.getByText('(up)')).toBeInTheDocument();
    expect(screen.getByText('(down)')).toBeInTheDocument();
  });
  
  it('shows correct interfaces in target dropdown', async () => {
    render(<Properties />);
    
    const targetSelect = screen.getByLabelText('Target Interface');
    fireEvent.mouseDown(targetSelect);
    
    await screen.findByText('FastEthernet0/1');
    expect(screen.getByText('FastEthernet0/1')).toBeInTheDocument();
    expect(screen.getByText('FastEthernet0/2')).toBeInTheDocument();
  });
  
  it('updates connection when source interface is changed', async () => {
    render(<Properties />);
    
    const sourceSelect = screen.getByLabelText('Source Interface');
    fireEvent.mouseDown(sourceSelect);
    
    const interface2 = await screen.findByText('GigabitEthernet0/1');
    fireEvent.click(interface2);
    
    expect(mockUpdateConnection).toHaveBeenCalledWith('conn1', {
      sourceInterfaceId: 'if2',
      sourcePort: 'GigabitEthernet0/1',
      type: 'ethernet',
    });
  });
  
  it('updates connection when target interface is changed', async () => {
    render(<Properties />);
    
    const targetSelect = screen.getByLabelText('Target Interface');
    fireEvent.mouseDown(targetSelect);
    
    const interface4 = await screen.findByText('FastEthernet0/2');
    fireEvent.click(interface4);
    
    expect(mockUpdateConnection).toHaveBeenCalledWith('conn1', {
      targetInterfaceId: 'if4',
      targetPort: 'FastEthernet0/2',
      type: 'ethernet',
    });
  });
  
  it('displays connection type as read-only field', () => {
    render(<Properties />);
    
    const connectionTypeField = screen.getByLabelText('Connection Type');
    expect(connectionTypeField).toBeDisabled();
    expect(connectionTypeField).toHaveValue('ethernet');
  });
  
  it('shows helpful text when no interfaces available', () => {
    // Test with device without interfaces
    const devicesWithoutInterfaces = [
      { ...mockDevices[0], interfaces: [] },
      { ...mockDevices[1], interfaces: [] },
    ];
    
    mockUseDiagramStore.mockReturnValue({
      selectedDevice: null,
      selectedConnection: mockConnection,
      updateDevice: jest.fn(),
      updateConnection: mockUpdateConnection,
      selectDevice: jest.fn(),
      selectConnection: mockSelectConnection,
      deleteDevice: jest.fn(),
      deleteConnection: mockDeleteConnection,
      devices: devicesWithoutInterfaces,
    });
    
    render(<Properties />);
    
    const sourceSelect = screen.getByLabelText('Source Interface');
    fireEvent.mouseDown(sourceSelect);
    
    // Dropdowns should be empty when no interfaces available
    expect(screen.queryByText('GigabitEthernet0/0')).not.toBeInTheDocument();
  });
  
  it('handles backward compatibility with sourcePort/targetPort', () => {
    const legacyConnection: Connection = {
      id: 'conn2',
      source: 'device1',
      target: 'device2',
      type: 'ethernet',
      sourcePort: 'GigabitEthernet0/0',
      targetPort: 'FastEthernet0/1',
      // No sourceInterfaceId/targetInterfaceId
    };
    
    mockUseDiagramStore.mockReturnValue({
      selectedDevice: null,
      selectedConnection: legacyConnection,
      updateDevice: jest.fn(),
      updateConnection: mockUpdateConnection,
      selectDevice: jest.fn(),
      selectConnection: mockSelectConnection,
      deleteDevice: jest.fn(),
      deleteConnection: mockDeleteConnection,
      devices: mockDevices,
    });
    
    render(<Properties />);
    
    // Should auto-select interfaces based on port names
    const sourceSelect = screen.getByLabelText('Source Interface');
    expect(sourceSelect).toHaveTextContent('GigabitEthernet0/0');
    
    const targetSelect = screen.getByLabelText('Target Interface');
    expect(targetSelect).toHaveTextContent('FastEthernet0/1');
  });
});