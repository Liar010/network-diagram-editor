import { NetworkInterface, DeviceType } from './network';

export interface DeviceConfigTemplate {
  version: string;
  deviceConfigs: {
    [key in DeviceType]?: {
      config?: {
        hostname?: string;
        managementIp?: string;
        [key: string]: any;
      };
      interfaces?: Omit<NetworkInterface, 'id' | 'connectedTo'>[];
    };
  };
}

export interface DeviceConfigImportOptions {
  mode: 'all' | 'selected' | 'type'; // 全デバイス、選択デバイス、特定タイプ
  overwriteExisting: boolean; // 既存の設定を上書きするか
  mergeInterfaces: boolean; // インターフェースをマージするか置き換えるか
}