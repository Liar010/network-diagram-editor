import { NetworkDevice, DeviceType } from '../../types/network';
import { createDeviceWithInterfaces } from '../../utils/migrationUtils';

export function createTestDevice(overrides?: Partial<NetworkDevice>): NetworkDevice {
  const baseDevice = {
    type: 'router' as DeviceType,
    name: 'Test Device',
    position: { x: 0, y: 0 },
    config: {},
    ...overrides
  };
  
  const deviceWithInterfaces = createDeviceWithInterfaces(baseDevice);
  
  return {
    ...deviceWithInterfaces,
    id: overrides?.id || 'test-device-1'
  } as NetworkDevice;
}

export function createTestDeviceWithoutId(overrides?: Partial<Omit<NetworkDevice, 'id'>>): Omit<NetworkDevice, 'id'> {
  const baseDevice = {
    type: 'router' as DeviceType,
    name: 'Test Device',
    position: { x: 0, y: 0 },
    config: {},
    ...overrides
  };
  
  return createDeviceWithInterfaces(baseDevice);
}