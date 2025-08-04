import { NetworkDevice, NetworkInterface } from '../types/network';
import { generateId } from './idGenerator';

/**
 * 既存のデバイスデータを新しいインターフェース形式に移行
 */
export function migrateDeviceToInterfaces(device: any): NetworkDevice {
  // すでに新形式の場合はそのまま返す
  if (device.interfaces && Array.isArray(device.interfaces)) {
    return device as NetworkDevice;
  }

  const migratedDevice: NetworkDevice = {
    id: device.id,
    type: device.type,
    name: device.name,
    position: device.position,
    interfaces: [],
    config: {
      hostname: device.config?.hostname || device.name,
      managementIp: device.config?.ipAddress,
      // 後方互換性のため残す
      ipAddress: device.config?.ipAddress,
      subnet: device.config?.subnet,
      vlan: device.config?.vlan,
    }
  };

  // 旧形式のデータから初期インターフェースを作成
  if (device.config?.ipAddress || device.config?.vlan) {
    const defaultInterface: NetworkInterface = {
      id: generateId('intf'),
      name: getDefaultInterfaceName(device.type),
      type: 'ethernet',
      status: 'up',
      ipAddress: device.config?.ipAddress,
      subnet: device.config?.subnet,
      vlans: device.config?.vlan ? [parseInt(device.config.vlan)] : undefined,
      mode: device.config?.vlan ? 'access' : 'routed',
    };
    migratedDevice.interfaces.push(defaultInterface);
  }

  // デバイスタイプに応じてデフォルトインターフェースを追加
  const additionalInterfaces = createDefaultInterfaces(device.type);
  migratedDevice.interfaces.push(...additionalInterfaces);

  return migratedDevice;
}

/**
 * デバイスタイプに基づいてデフォルトのインターフェース名を取得
 */
function getDefaultInterfaceName(deviceType: string): string {
  switch (deviceType) {
    case 'router':
      return 'gi0/0';
    case 'switch':
      return 'gi1/0/1';
    case 'firewall':
      return 'eth0';
    case 'server':
      return 'eth0';
    case 'workstation':
      return 'eth0';
    case 'access-point':
      return 'lan0';
    default:
      return 'eth0';
  }
}

/**
 * デバイスタイプに応じたデフォルトインターフェースを作成
 */
function createDefaultInterfaces(deviceType: string): NetworkInterface[] {
  const interfaces: NetworkInterface[] = [];
  
  switch (deviceType) {
    case 'router':
      // ルーターは複数のインターフェースを持つ
      for (let i = 1; i <= 2; i++) {
        interfaces.push({
          id: generateId('intf'),
          name: `gi0/${i}`,
          type: 'ethernet',
          status: 'down',
          speed: '1000',
          mode: 'routed'
        });
      }
      break;
      
    case 'switch':
      // スイッチは多数のアクセスポートを持つ
      for (let i = 2; i <= 4; i++) {
        interfaces.push({
          id: generateId('intf'),
          name: `gi1/0/${i}`,
          type: 'ethernet',
          status: 'down',
          speed: '1000',
          mode: 'access'
        });
      }
      break;
      
    case 'firewall':
      // ファイアウォールは複数のセキュリティゾーン用インターフェースを持つ
      ['eth1', 'eth2'].forEach((name, index) => {
        interfaces.push({
          id: generateId('intf'),
          name,
          type: 'ethernet',
          status: 'down',
          speed: '1000',
          mode: 'routed',
          description: index === 0 ? 'DMZ' : 'Internal'
        });
      });
      break;
      
    case 'server':
      // サーバーは冗長性のための複数NICを持つ場合がある
      interfaces.push({
        id: generateId('intf'),
        name: 'eth1',
        type: 'ethernet',
        status: 'down',
        speed: '1000',
        mode: 'access'
      });
      break;
  }
  
  return interfaces;
}

/**
 * 接続情報を新しいインターフェースIDに更新
 */
export function migrateConnectionToInterfaceIds(
  connection: any,
  devices: NetworkDevice[]
): any {
  // すでに新形式の場合はそのまま返す
  if (connection.sourceInterfaceId && connection.targetInterfaceId) {
    return connection;
  }

  const sourceDevice = devices.find(d => d.id === connection.source);
  const targetDevice = devices.find(d => d.id === connection.target);

  if (!sourceDevice || !targetDevice) {
    return connection;
  }

  // 接続に使用するインターフェースを自動選択
  const sourceInterface = findAvailableInterface(sourceDevice, connection.sourcePort);
  const targetInterface = findAvailableInterface(targetDevice, connection.targetPort);

  return {
    ...connection,
    sourceInterfaceId: sourceInterface?.id,
    targetInterfaceId: targetInterface?.id,
  };
}

/**
 * 利用可能なインターフェースを見つける
 */
function findAvailableInterface(
  device: NetworkDevice,
  portName?: string
): NetworkInterface | undefined {
  if (!device.interfaces || device.interfaces.length === 0) {
    return undefined;
  }

  // ポート名が指定されている場合は一致するものを探す
  if (portName) {
    const matchingInterface = device.interfaces.find(
      intf => intf.name.toLowerCase() === portName.toLowerCase()
    );
    if (matchingInterface) {
      return matchingInterface;
    }
  }

  // 接続されていない最初のインターフェースを返す
  return device.interfaces.find(intf => !intf.connectedTo) || device.interfaces[0];
}

/**
 * デバイス作成時にデフォルトのインターフェースを生成
 */
export function createDeviceWithInterfaces(
  device: Omit<NetworkDevice, 'id' | 'interfaces'>
): Omit<NetworkDevice, 'id'> {
  const interfaces: NetworkInterface[] = [];
  
  // デバイスタイプに基づいてインターフェースを生成
  const defaultInterface: NetworkInterface = {
    id: generateId('intf'),
    name: getDefaultInterfaceName(device.type),
    type: 'ethernet',
    status: 'up',
    speed: '1000',
    mode: device.config?.ipAddress ? 'routed' : 'access',
    ipAddress: device.config?.ipAddress,
    subnet: device.config?.subnet,
    vlans: device.config?.vlan ? [parseInt(device.config.vlan as string)] : undefined,
  };
  
  interfaces.push(defaultInterface);
  
  // 追加のインターフェースを作成
  const additionalInterfaces = createDefaultInterfaces(device.type);
  interfaces.push(...additionalInterfaces);
  
  return {
    ...device,
    interfaces
  };
}