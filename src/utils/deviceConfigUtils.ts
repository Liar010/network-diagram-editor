import { DeviceConfigTemplate, DeviceConfigImportOptions } from '../types/deviceConfig';
import { NetworkDevice, NetworkInterface, DeviceType } from '../types/network';
import { generateId } from './idGenerator';

/**
 * デバイス設定テンプレートをエクスポート
 */
export const exportDeviceConfig = (devices: NetworkDevice[]): DeviceConfigTemplate => {
  const template: DeviceConfigTemplate = {
    version: '1.0',
    deviceConfigs: {}
  };

  // デバイスタイプごとに設定を集約
  const devicesByType = devices.reduce((acc, device) => {
    if (!acc[device.type]) {
      acc[device.type] = [];
    }
    acc[device.type].push(device);
    return acc;
  }, {} as Record<DeviceType, NetworkDevice[]>);

  // 各タイプの最初のデバイスから設定を取得（代表的な設定として）
  Object.entries(devicesByType).forEach(([type, typeDevices]) => {
    const representativeDevice = typeDevices[0];
    template.deviceConfigs[type as DeviceType] = {
      config: {
        hostname: representativeDevice.config.hostname,
        managementIp: representativeDevice.config.managementIp,
        ...Object.fromEntries(
          Object.entries(representativeDevice.config).filter(
            ([key]) => !['hostname', 'managementIp', 'ipAddress', 'subnet', 'vlan'].includes(key)
          )
        )
      },
      interfaces: representativeDevice.interfaces.map(intf => ({
        name: intf.name,
        type: intf.type,
        speed: intf.speed,
        status: intf.status,
        ipAddress: intf.ipAddress,
        subnet: intf.subnet,
        vlans: intf.vlans,
        mode: intf.mode,
        description: intf.description
      }))
    };
  });

  return template;
};

/**
 * デバイス設定テンプレートをインポート
 */
export const importDeviceConfig = (
  devices: NetworkDevice[],
  template: DeviceConfigTemplate,
  options: DeviceConfigImportOptions
): NetworkDevice[] => {
  // バージョンチェック
  if (template.version !== '1.0') {
    console.warn(`Template version ${template.version} may not be fully compatible`);
  }

  return devices.map(device => {
    // インポート対象かどうかを判定
    const shouldImport = 
      options.mode === 'all' ||
      (options.mode === 'type' && template.deviceConfigs[device.type]) ||
      (options.mode === 'selected' && device.id); // 選択状態は呼び出し側で判定

    if (!shouldImport || !template.deviceConfigs[device.type]) {
      return device;
    }

    const configTemplate = template.deviceConfigs[device.type]!;
    const updatedDevice = { ...device };

    // 基本設定の適用
    if (configTemplate.config) {
      if (options.overwriteExisting) {
        updatedDevice.config = { ...configTemplate.config };
      } else {
        updatedDevice.config = {
          ...updatedDevice.config,
          ...Object.fromEntries(
            Object.entries(configTemplate.config).filter(
              ([key, value]) => !updatedDevice.config[key] && value !== undefined
            )
          )
        };
      }
    }

    // インターフェース設定の適用
    if (configTemplate.interfaces) {
      if (options.mergeInterfaces) {
        // 既存のインターフェースとマージ
        const existingInterfaceNames = updatedDevice.interfaces.map(i => i.name);
        const newInterfaces = configTemplate.interfaces
          .filter(i => !existingInterfaceNames.includes(i.name))
          .map(intf => ({
            ...intf,
            id: generateId('intf')
          } as NetworkInterface));
        
        // 既存のインターフェースを更新
        updatedDevice.interfaces = updatedDevice.interfaces.map(existingIntf => {
          const templateIntf = configTemplate.interfaces!.find(i => i.name === existingIntf.name);
          if (templateIntf && options.overwriteExisting) {
            return {
              ...existingIntf,
              ...templateIntf,
              id: existingIntf.id,
              connectedTo: existingIntf.connectedTo // 接続情報は保持
            };
          }
          return existingIntf;
        });
        
        // 新しいインターフェースを追加
        updatedDevice.interfaces = [...updatedDevice.interfaces, ...newInterfaces];
      } else {
        // インターフェースを完全に置き換え
        updatedDevice.interfaces = configTemplate.interfaces.map(intf => ({
          ...intf,
          id: generateId('intf')
        } as NetworkInterface));
      }
    }

    return updatedDevice;
  });
};

/**
 * JSON文字列をDeviceConfigTemplateにパース
 */
export const parseDeviceConfigJSON = (jsonString: string): DeviceConfigTemplate => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // 基本的な構造検証
    if (!parsed.version || !parsed.deviceConfigs) {
      throw new Error('Invalid template structure: missing version or deviceConfigs');
    }
    
    // 各デバイスタイプの設定を検証
    Object.entries(parsed.deviceConfigs).forEach(([type, config]: [string, any]) => {
      const validTypes: DeviceType[] = ['router', 'switch', 'firewall', 'server', 'load-balancer', 'cloud', 'workstation', 'access-point'];
      if (!validTypes.includes(type as DeviceType)) {
        throw new Error(`Invalid device type: ${type}`);
      }
      
      if (config.interfaces && Array.isArray(config.interfaces)) {
        config.interfaces.forEach((intf: any, index: number) => {
          if (!intf.name) {
            throw new Error(`Interface at index ${index} for ${type} is missing name`);
          }
          if (intf.vlans && !Array.isArray(intf.vlans)) {
            throw new Error(`VLANs must be an array for interface ${intf.name}`);
          }
        });
      }
    });
    
    return parsed as DeviceConfigTemplate;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
};

/**
 * DeviceConfigTemplateをJSON文字列に変換（整形済み）
 */
export const stringifyDeviceConfig = (template: DeviceConfigTemplate): string => {
  return JSON.stringify(template, null, 2);
};

/**
 * IPアドレスの妥当性チェック
 */
export const validateIPAddress = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * サブネットマスクの妥当性チェック
 */
export const validateSubnetMask = (subnet: string): boolean => {
  const subnetRegex = /^(?:(?:255|254|252|248|240|224|192|128|0)\.){3}(?:255|254|252|248|240|224|192|128|0)$/;
  return subnetRegex.test(subnet);
};

/**
 * VLANの妥当性チェック
 */
export const validateVLAN = (vlan: number): boolean => {
  return vlan >= 1 && vlan <= 4094;
};