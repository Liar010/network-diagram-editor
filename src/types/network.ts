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
  interfaces: NetworkInterface[]; // 複数インターフェースをサポート
  config: {
    hostname?: string;
    managementIp?: string; // 管理用IP
    // 後方互換性のため残す（将来的に削除予定）
    ipAddress?: string;
    subnet?: string;
    vlan?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface NetworkInterface {
  id: string;
  name: string; // "eth0", "gi0/1" など
  type: 'ethernet' | 'serial' | 'fiber' | 'wireless';
  speed?: string; // "1000", "10000" (Mbps)
  status: 'up' | 'down' | 'admin-down';
  ipAddress?: string;
  subnet?: string;
  vlans?: number[]; // トランクポートは複数VLAN、アクセスポートは1つ
  mode?: 'access' | 'trunk' | 'routed'; // ポートモード
  description?: string;
  connectedTo?: {
    deviceId: string;
    interfaceId: string;
  };
}

// 後方互換性のためのエイリアス
export type Interface = NetworkInterface;

export interface ConnectionStyle {
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeColor: string;
  strokeWidth: number;
  animated?: boolean;
}

export interface Connection {
  id: string;
  source: string; // デバイスID
  target: string; // デバイスID
  sourceInterfaceId?: string; // インターフェースID
  targetInterfaceId?: string; // インターフェースID
  // 後方互換性のため残す
  sourceInterface?: string;
  targetInterface?: string;
  type: 'ethernet' | 'serial' | 'fiber' | 'wireless';
  label?: string;
  bandwidth?: string;  // e.g., "1 Gbps", "10 Mbps"
  sourcePort?: string; // 後方互換性のため残す
  targetPort?: string; // 後方互換性のため残す
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