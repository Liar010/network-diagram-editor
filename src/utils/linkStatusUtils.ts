import { NetworkInterface, Connection, ConnectionStyle, NetworkDevice } from '../types/network';

/**
 * リンクステータスを判定
 */
export interface LinkStatus {
  isUp: boolean;
  reason?: string;
}

/**
 * インターフェースが接続可能かどうかを判定
 */
export const canInterfaceConnect = (
  interface1: NetworkInterface | undefined,
  interface2: NetworkInterface | undefined
): boolean => {
  if (!interface1 || !interface2) return false;
  
  // Admin Downのインターフェースは接続不可
  if (interface1.status === 'admin-down' || interface2.status === 'admin-down') {
    return false;
  }
  
  // タイプが異なる場合は接続不可
  if (interface1.type !== interface2.type) {
    return false;
  }
  
  // 速度の互換性チェック（10倍以上の差がある場合は接続不可）
  if (interface1.speed && interface2.speed) {
    const speed1 = parseInt(interface1.speed);
    const speed2 = parseInt(interface2.speed);
    if (!isNaN(speed1) && !isNaN(speed2)) {
      const ratio = Math.max(speed1, speed2) / Math.min(speed1, speed2);
      if (ratio > 10) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * インターフェースのステータスを自動判定
 * Admin Downでない限り、接続状態に基づいてUp/Downを返す
 */
export const determineInterfaceStatus = (
  currentInterface: NetworkInterface,
  connectedInterface?: NetworkInterface,
  isInterfaceSelected: boolean = true
): 'up' | 'down' | 'admin-down' => {
  // Admin Downは維持
  if (currentInterface.status === 'admin-down') {
    return 'admin-down';
  }
  
  // インターフェースが選択されていない場合はDown
  if (!isInterfaceSelected) {
    return 'down';
  }
  
  // 接続先がない場合はDown
  if (!connectedInterface) {
    return 'down';
  }
  
  // 接続先がAdmin Downの場合はDown
  if (connectedInterface.status === 'admin-down') {
    return 'down';
  }
  
  // 接続可能性をチェック
  if (canInterfaceConnect(currentInterface, connectedInterface)) {
    return 'up';
  }
  
  return 'down';
};

/**
 * 2つのインターフェース間のリンクステータスを判定
 */
export const determineLinkStatus = (
  sourceInterface: NetworkInterface | undefined,
  targetInterface: NetworkInterface | undefined
): LinkStatus => {
  // インターフェースが存在しない場合
  if (!sourceInterface || !targetInterface) {
    return {
      isUp: false,
      reason: 'Interface not found'
    };
  }

  // Admin Downの場合は無条件でリンクダウン
  if (sourceInterface.status === 'admin-down' || targetInterface.status === 'admin-down') {
    return {
      isUp: false,
      reason: 'Interface administratively down'
    };
  }

  // インターフェースタイプが一致しない場合
  if (sourceInterface.type !== targetInterface.type) {
    return {
      isUp: false,
      reason: `Type mismatch: ${sourceInterface.type} <-> ${targetInterface.type}`
    };
  }

  // 速度が設定されている場合、速度の互換性をチェック
  if (sourceInterface.speed && targetInterface.speed) {
    const sourceSpeed = parseInt(sourceInterface.speed);
    const targetSpeed = parseInt(targetInterface.speed);
    
    // 速度が大きく異なる場合（10倍以上の差）は警告
    if (!isNaN(sourceSpeed) && !isNaN(targetSpeed)) {
      const ratio = Math.max(sourceSpeed, targetSpeed) / Math.min(sourceSpeed, targetSpeed);
      if (ratio > 10) {
        return {
          isUp: false,
          reason: `Speed mismatch: ${sourceInterface.speed}Mbps <-> ${targetInterface.speed}Mbps`
        };
      }
    }
  }

  // すべての条件をクリアした場合はリンクアップ
  return {
    isUp: true
  };
};

/**
 * リンクステータスに基づいて接続スタイルを生成
 */
export const getConnectionStyleFromLinkStatus = (
  linkStatus: LinkStatus,
  currentStyle?: ConnectionStyle
): ConnectionStyle => {
  if (linkStatus.isUp) {
    // リンクアップ: アニメーション付き、青色
    return {
      strokeStyle: currentStyle?.strokeStyle || 'solid',
      strokeColor: '#4caf50', // 緑色でリンクアップを表現
      strokeWidth: currentStyle?.strokeWidth || 2,
      animated: true // 通信可能を明示
    };
  } else {
    // リンクダウン: 点線、赤色
    return {
      strokeStyle: 'dashed',
      strokeColor: '#f44336', // 赤色でリンクダウンを表現
      strokeWidth: currentStyle?.strokeWidth || 2,
      animated: false // 通信不可を明示
    };
  }
};

/**
 * 接続とインターフェース情報から自動的にスタイルを決定
 */
export const autoUpdateConnectionStyle = (
  connection: Connection,
  sourceInterface?: NetworkInterface,
  targetInterface?: NetworkInterface
): ConnectionStyle => {
  const linkStatus = determineLinkStatus(sourceInterface, targetInterface);
  return getConnectionStyleFromLinkStatus(linkStatus, connection.style);
};

/**
 * インターフェースの速度をMbps単位で正規化
 */
export const normalizeSpeed = (speed: string | undefined): number | null => {
  if (!speed) return null;
  
  const value = parseFloat(speed);
  if (isNaN(value)) return null;
  
  // 単位を含む場合の処理
  const lowerSpeed = speed.toLowerCase();
  if (lowerSpeed.includes('g')) {
    return value * 1000; // Gbps to Mbps
  } else if (lowerSpeed.includes('m')) {
    return value; // Already in Mbps
  } else if (lowerSpeed.includes('k')) {
    return value / 1000; // Kbps to Mbps
  }
  
  // 単位がない場合はMbpsと仮定
  return value;
};

/**
 * リンクステータスの詳細メッセージを生成
 */
export const getLinkStatusMessage = (linkStatus: LinkStatus): string => {
  if (linkStatus.isUp) {
    return 'Link is up and operational';
  }
  return linkStatus.reason || 'Link is down';
};