import { NetworkDevice, Connection } from '../types/network';

export type LayerType = 'L1' | 'L2' | 'L3';

interface LayerVisibility {
  showIPAddress: boolean;
  showSubnet: boolean;
  showVLAN: boolean;
  showPorts: boolean;
  showBandwidth: boolean;
  connectionStyle: {
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    strokeWidth: number;
  };
}

export const layerVisibilitySettings: Record<LayerType, LayerVisibility> = {
  L1: {
    showIPAddress: false,
    showSubnet: false,
    showVLAN: false,
    showPorts: true,
    showBandwidth: true,
    connectionStyle: {
      strokeStyle: 'solid',
      strokeWidth: 3,
    },
  },
  L2: {
    showIPAddress: false,
    showSubnet: false,
    showVLAN: true,
    showPorts: true,
    showBandwidth: true,
    connectionStyle: {
      strokeStyle: 'dashed',
      strokeWidth: 2,
    },
  },
  L3: {
    showIPAddress: true,
    showSubnet: true,
    showVLAN: false,
    showPorts: false,
    showBandwidth: false,
    connectionStyle: {
      strokeStyle: 'dotted',
      strokeWidth: 2,
    },
  },
};

export const getDeviceDisplayInfo = (device: NetworkDevice, layer: LayerType): string[] => {
  const settings = layerVisibilitySettings[layer];
  const info: string[] = [device.name];
  
  if (settings.showIPAddress && device.config.ipAddress) {
    info.push(`IP: ${device.config.ipAddress}`);
  }
  
  if (settings.showSubnet && device.config.subnet) {
    info.push(`Subnet: ${device.config.subnet}`);
  }
  
  if (settings.showVLAN && device.config.vlan) {
    info.push(`VLAN: ${device.config.vlan}`);
  }
  
  return info;
};

export const getConnectionDisplayInfo = (connection: Connection, layer: LayerType): string | undefined => {
  const settings = layerVisibilitySettings[layer];
  const parts: string[] = [];
  
  if (settings.showPorts) {
    if (connection.sourcePort || connection.targetPort) {
      parts.push(`${connection.sourcePort || '?'} ↔ ${connection.targetPort || '?'}`);
    }
  }
  
  if (settings.showBandwidth && connection.bandwidth) {
    parts.push(connection.bandwidth);
  }
  
  if (connection.label) {
    parts.push(connection.label);
  }
  
  return parts.length > 0 ? parts.join('\n') : undefined;
};

export const getConnectionStyleForLayer = (connection: Connection, layer: LayerType) => {
  const layerStyle = layerVisibilitySettings[layer].connectionStyle;
  
  // If connection has custom style, merge with layer defaults
  if (connection.style) {
    return {
      ...connection.style,
      strokeStyle: connection.style.strokeStyle || layerStyle.strokeStyle,
      strokeWidth: connection.style.strokeWidth || layerStyle.strokeWidth,
    };
  }
  
  // Use layer defaults
  return {
    strokeStyle: layerStyle.strokeStyle,
    strokeColor: '#1976d2',
    strokeWidth: layerStyle.strokeWidth,
    animated: false,
  };
};