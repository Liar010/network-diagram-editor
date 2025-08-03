export type DeviceType = 
  | 'router'
  | 'switch'
  | 'firewall'
  | 'server'
  | 'load-balancer'
  | 'cloud'
  | 'workstation'
  | 'access-point';

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  position: { x: number; y: number };
  config: {
    ipAddress?: string;
    subnet?: string;
    vlan?: string;
    interfaces?: Interface[];
    [key: string]: string | number | boolean | Interface[] | undefined;
  };
}

export interface Interface {
  id: string;
  name: string;
  type: 'ethernet' | 'serial' | 'fiber';
  speed?: string;
  status: 'up' | 'down';
  connectedTo?: string;
}

export interface ConnectionStyle {
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeColor: string;
  strokeWidth: number;
  animated?: boolean;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceInterface?: string;
  targetInterface?: string;
  type: 'ethernet' | 'serial' | 'fiber' | 'wireless';
  label?: string;
  bandwidth?: string;  // e.g., "1 Gbps", "10 Mbps"
  sourcePort?: string; // e.g., "Gi0/1", "Fa0/2"
  targetPort?: string;
  style?: ConnectionStyle;
}

export interface DeviceGroup {
  id: string;
  name: string;
  deviceIds: string[];
  position: { x: number; y: number };
  collapsed: boolean;
  color?: string;
}

export interface NetworkDiagram {
  id: string;
  name: string;
  devices: NetworkDevice[];
  connections: Connection[];
  groups: DeviceGroup[];
  layer: 'L1' | 'L2' | 'L3';
  createdAt: Date;
  updatedAt: Date;
}