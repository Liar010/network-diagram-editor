import { NetworkDevice, Connection, NetworkDiagram } from '../types/network';
import { createDeviceWithInterfaces } from '../utils/migrationUtils';

export interface NetworkTemplate {
  id: string;
  name: string;
  description: string;
  devices: Omit<NetworkDevice, 'id' | 'interfaces'>[];
  connections: Omit<Connection, 'id' | 'source' | 'target'>[];
  connectionMap: Array<{ sourceIndex: number; targetIndex: number }>;
}

export const networkTemplates: NetworkTemplate[] = [
  {
    id: 'simple-lan',
    name: 'Simple LAN',
    description: 'A basic local area network with router, switch, and workstations',
    devices: [
      {
        type: 'router',
        name: 'Main Router',
        position: { x: 300, y: 50 },
        config: { ipAddress: '192.168.1.1', subnet: '255.255.255.0' }
      },
      {
        type: 'switch',
        name: 'Core Switch',
        position: { x: 300, y: 200 },
        config: { vlan: '1' }
      },
      {
        type: 'workstation',
        name: 'PC 1',
        position: { x: 150, y: 350 },
        config: { ipAddress: '192.168.1.10' }
      },
      {
        type: 'workstation',
        name: 'PC 2',
        position: { x: 300, y: 350 },
        config: { ipAddress: '192.168.1.11' }
      },
      {
        type: 'workstation',
        name: 'PC 3',
        position: { x: 450, y: 350 },
        config: { ipAddress: '192.168.1.12' }
      }
    ],
    connections: [
      { type: 'ethernet', label: 'Uplink' },
      { type: 'ethernet', label: 'Port 1' },
      { type: 'ethernet', label: 'Port 2' },
      { type: 'ethernet', label: 'Port 3' }
    ],
    connectionMap: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
      { sourceIndex: 1, targetIndex: 3 },
      { sourceIndex: 1, targetIndex: 4 }
    ]
  },
  {
    id: 'dmz-network',
    name: 'DMZ Network',
    description: 'Corporate network with DMZ, internal network, and firewall',
    devices: [
      {
        type: 'router',
        name: 'Internet Router',
        position: { x: 300, y: 50 },
        config: { ipAddress: '203.0.113.1' }
      },
      {
        type: 'firewall',
        name: 'Perimeter Firewall',
        position: { x: 300, y: 150 },
        config: { ipAddress: '203.0.113.2' }
      },
      {
        type: 'switch',
        name: 'DMZ Switch',
        position: { x: 150, y: 250 },
        config: { vlan: '10' }
      },
      {
        type: 'switch',
        name: 'Internal Switch',
        position: { x: 450, y: 250 },
        config: { vlan: '20' }
      },
      {
        type: 'server',
        name: 'Web Server',
        position: { x: 50, y: 350 },
        config: { ipAddress: '10.0.10.10' }
      },
      {
        type: 'server',
        name: 'Mail Server',
        position: { x: 250, y: 350 },
        config: { ipAddress: '10.0.10.20' }
      },
      {
        type: 'workstation',
        name: 'Admin PC',
        position: { x: 400, y: 350 },
        config: { ipAddress: '10.0.20.10' }
      },
      {
        type: 'server',
        name: 'File Server',
        position: { x: 550, y: 350 },
        config: { ipAddress: '10.0.20.20' }
      }
    ],
    connections: [
      { type: 'ethernet', label: 'Internet' },
      { type: 'ethernet', label: 'DMZ' },
      { type: 'ethernet', label: 'Internal' },
      { type: 'ethernet', label: 'Web' },
      { type: 'ethernet', label: 'Mail' },
      { type: 'ethernet', label: 'Admin' },
      { type: 'ethernet', label: 'Files' }
    ],
    connectionMap: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
      { sourceIndex: 1, targetIndex: 3 },
      { sourceIndex: 2, targetIndex: 4 },
      { sourceIndex: 2, targetIndex: 5 },
      { sourceIndex: 3, targetIndex: 6 },
      { sourceIndex: 3, targetIndex: 7 }
    ]
  },
  {
    id: 'cloud-hybrid',
    name: 'Cloud Hybrid Network',
    description: 'Hybrid cloud architecture with on-premises and cloud resources',
    devices: [
      {
        type: 'router',
        name: 'Branch Router',
        position: { x: 100, y: 100 },
        config: { ipAddress: '192.168.1.1' }
      },
      {
        type: 'firewall',
        name: 'Branch Firewall',
        position: { x: 100, y: 200 },
        config: {}
      },
      {
        type: 'switch',
        name: 'Branch Switch',
        position: { x: 100, y: 300 },
        config: {}
      },
      {
        type: 'workstation',
        name: 'Employee PC',
        position: { x: 100, y: 400 },
        config: { ipAddress: '192.168.1.10' }
      },
      {
        type: 'cloud',
        name: 'AWS Cloud',
        position: { x: 400, y: 150 },
        config: {}
      },
      {
        type: 'load-balancer',
        name: 'Cloud Load Balancer',
        position: { x: 400, y: 250 },
        config: {}
      },
      {
        type: 'server',
        name: 'Web Server 1',
        position: { x: 350, y: 350 },
        config: { ipAddress: '10.0.1.10' }
      },
      {
        type: 'server',
        name: 'Web Server 2',
        position: { x: 450, y: 350 },
        config: { ipAddress: '10.0.1.11' }
      }
    ],
    connections: [
      { type: 'ethernet', label: 'WAN' },
      { type: 'ethernet', label: 'Secured' },
      { type: 'ethernet', label: 'LAN' },
      { type: 'ethernet', label: 'VPN Tunnel' },
      { type: 'ethernet', label: 'Cloud LB' },
      { type: 'ethernet', label: 'Server 1' },
      { type: 'ethernet', label: 'Server 2' }
    ],
    connectionMap: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
      { sourceIndex: 2, targetIndex: 3 },
      { sourceIndex: 0, targetIndex: 4 },
      { sourceIndex: 4, targetIndex: 5 },
      { sourceIndex: 5, targetIndex: 6 },
      { sourceIndex: 5, targetIndex: 7 }
    ]
  }
];

export const createDiagramFromTemplate = (template: NetworkTemplate): NetworkDiagram => {
  const devices: NetworkDevice[] = template.devices.map((device, index) => {
    const deviceWithInterfaces = createDeviceWithInterfaces(device);
    return {
      ...deviceWithInterfaces,
      id: `device-${Math.random().toString(36).substr(2, 9)}-${index}`
    } as NetworkDevice;
  });

  const connections: Connection[] = template.connectionMap.map((conn, index) => ({
    id: `conn-${Math.random().toString(36).substr(2, 9)}-${index}`,
    source: devices[conn.sourceIndex].id,
    target: devices[conn.targetIndex].id,
    ...template.connections[index]
  }));

  return {
    id: `diagram-${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    devices,
    connections,
    groups: [],
    layer: 'L3',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};