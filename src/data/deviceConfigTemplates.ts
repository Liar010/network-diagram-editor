import { DeviceConfigTemplate } from '../types/deviceConfig';

// エンタープライズネットワーク向けテンプレート
export const enterpriseTemplate: DeviceConfigTemplate = {
  version: '1.0',
  deviceConfigs: {
    router: {
      config: {
        hostname: 'RTR-CORE-01',
        managementIp: '10.0.0.1'
      },
      interfaces: [
        {
          name: 'gi0/0/0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.1.1.1',
          subnet: '255.255.255.0',
          description: 'LAN Interface'
        },
        {
          name: 'gi0/0/1',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '192.168.1.1',
          subnet: '255.255.255.252',
          description: 'WAN Interface'
        },
        {
          name: 'gi0/0/2',
          type: 'ethernet',
          speed: '1000',
          status: 'down',
          mode: 'routed',
          description: 'Backup WAN'
        },
        {
          name: 'gi0/0/3',
          type: 'ethernet',
          speed: '1000',
          status: 'admin-down',
          mode: 'routed',
          description: 'Reserved'
        }
      ]
    },
    switch: {
      config: {
        hostname: 'SW-DIST-01',
        managementIp: '10.0.1.1'
      },
      interfaces: [
        {
          name: 'gi1/0/1',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'trunk',
          vlans: [1, 10, 20, 30, 40, 99],
          description: 'Uplink to Core Router'
        },
        {
          name: 'gi1/0/2',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'trunk',
          vlans: [1, 10, 20, 30, 40, 99],
          description: 'Link to SW-DIST-02'
        },
        {
          name: 'gi1/0/3',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [10],
          description: 'User VLAN 10'
        },
        {
          name: 'gi1/0/4',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [20],
          description: 'Server VLAN 20'
        },
        {
          name: 'gi1/0/5',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [30],
          description: 'Voice VLAN 30'
        },
        {
          name: 'gi1/0/6',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [40],
          description: 'Guest VLAN 40'
        },
        {
          name: 'gi1/0/24',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [99],
          description: 'Management VLAN'
        },
        {
          name: 'te1/0/1',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'trunk',
          vlans: [1, 10, 20, 30, 40, 99],
          description: '10G Uplink to Core'
        }
      ]
    },
    firewall: {
      config: {
        hostname: 'FW-EDGE-01',
        managementIp: '10.0.2.1'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '203.0.113.1',
          subnet: '255.255.255.248',
          description: 'Outside (Internet)'
        },
        {
          name: 'eth1',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.1.1.254',
          subnet: '255.255.255.0',
          description: 'Inside (LAN)'
        },
        {
          name: 'eth2',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.0.1',
          subnet: '255.255.255.0',
          description: 'DMZ'
        },
        {
          name: 'eth3',
          type: 'ethernet',
          speed: '1000',
          status: 'admin-down',
          mode: 'routed',
          description: 'Reserved'
        }
      ]
    },
    server: {
      config: {
        hostname: 'SRV-APP-01',
        managementIp: '10.20.1.10'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.20.1.10',
          subnet: '255.255.255.0',
          description: 'Primary Network'
        },
        {
          name: 'eth1',
          type: 'ethernet',
          speed: '1000',
          status: 'down',
          mode: 'routed',
          description: 'Backup Network'
        }
      ]
    },
    'load-balancer': {
      config: {
        hostname: 'LB-WEB-01',
        managementIp: '10.30.1.1'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.30.1.1',
          subnet: '255.255.255.0',
          description: 'Frontend VIP Network'
        },
        {
          name: 'eth1',
          type: 'ethernet',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.30.2.1',
          subnet: '255.255.255.0',
          description: 'Backend Server Pool'
        },
        {
          name: 'eth2',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.99.1.10',
          subnet: '255.255.255.0',
          description: 'Management'
        }
      ]
    },
    workstation: {
      config: {
        hostname: 'PC-USER-001'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.10.1.100',
          subnet: '255.255.255.0',
          description: 'LAN Connection'
        }
      ]
    },
    'access-point': {
      config: {
        hostname: 'AP-WIFI-01',
        managementIp: '10.40.1.1'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'trunk',
          vlans: [10, 30, 40],
          description: 'Uplink to Switch'
        },
        {
          name: 'wlan0',
          type: 'wireless',
          status: 'up',
          mode: 'access',
          vlans: [10],
          description: 'Corporate SSID'
        },
        {
          name: 'wlan1',
          type: 'wireless',
          status: 'up',
          mode: 'access',
          vlans: [40],
          description: 'Guest SSID'
        }
      ]
    },
    cloud: {
      config: {
        hostname: 'CLOUD-GW-01',
        managementIp: '10.50.0.1'
      },
      interfaces: [
        {
          name: 'vnic0',
          type: 'ethernet',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.50.0.1',
          subnet: '255.255.255.0',
          description: 'VPC Gateway'
        },
        {
          name: 'vnic1',
          type: 'ethernet',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.31.0.1',
          subnet: '255.255.0.0',
          description: 'Private Subnet'
        }
      ]
    }
  }
};

// データセンター向けテンプレート
export const datacenterTemplate: DeviceConfigTemplate = {
  version: '1.0',
  deviceConfigs: {
    router: {
      config: {
        hostname: 'DC-CORE-RTR-01',
        managementIp: '172.16.0.1'
      },
      interfaces: [
        {
          name: 'xe-0/0/0',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.1.1',
          subnet: '255.255.255.252',
          description: 'Core Interconnect'
        },
        {
          name: 'xe-0/0/1',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.1.5',
          subnet: '255.255.255.252',
          description: 'Distribution Layer'
        },
        {
          name: 'xe-0/0/2',
          type: 'fiber',
          speed: '40000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.1.9',
          subnet: '255.255.255.252',
          description: 'Internet Edge'
        }
      ]
    },
    switch: {
      config: {
        hostname: 'DC-TOR-SW-01',
        managementIp: '172.16.10.1'
      },
      interfaces: [
        {
          name: 'et-0/0/48',
          type: 'fiber',
          speed: '40000',
          status: 'up',
          mode: 'trunk',
          vlans: [100, 200, 300, 400, 500],
          description: 'Uplink to Spine'
        },
        {
          name: 'et-0/0/49',
          type: 'fiber',
          speed: '40000',
          status: 'up',
          mode: 'trunk',
          vlans: [100, 200, 300, 400, 500],
          description: 'Uplink to Spine (Backup)'
        },
        {
          name: 'xe-0/0/0',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'access',
          vlans: [100],
          description: 'Server Port'
        },
        {
          name: 'xe-0/0/1',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'access',
          vlans: [100],
          description: 'Server Port'
        }
      ]
    },
    server: {
      config: {
        hostname: 'DC-SRV-01',
        managementIp: '172.16.100.10'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.100.10',
          subnet: '255.255.255.0',
          description: 'Primary 10G Network'
        },
        {
          name: 'eth1',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.101.10',
          subnet: '255.255.255.0',
          description: 'Secondary 10G Network'
        },
        {
          name: 'ipmi',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.200.10',
          subnet: '255.255.255.0',
          description: 'IPMI/Management'
        }
      ]
    },
    'load-balancer': {
      config: {
        hostname: 'DC-LB-01',
        managementIp: '172.16.50.1'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'fiber',
          speed: '40000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.50.1',
          subnet: '255.255.255.0',
          description: '40G Frontend'
        },
        {
          name: 'eth1',
          type: 'fiber',
          speed: '40000',
          status: 'up',
          mode: 'routed',
          ipAddress: '172.16.51.1',
          subnet: '255.255.255.0',
          description: '40G Backend'
        }
      ]
    }
  }
};

// 小規模オフィス向けテンプレート
export const smallOfficeTemplate: DeviceConfigTemplate = {
  version: '1.0',
  deviceConfigs: {
    router: {
      config: {
        hostname: 'OFFICE-RTR-01',
        managementIp: '192.168.1.1'
      },
      interfaces: [
        {
          name: 'gi0/0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: 'DHCP',
          subnet: '',
          description: 'WAN (ISP)'
        },
        {
          name: 'gi0/1',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '192.168.1.1',
          subnet: '255.255.255.0',
          description: 'LAN'
        }
      ]
    },
    switch: {
      config: {
        hostname: 'OFFICE-SW-01',
        managementIp: '192.168.1.2'
      },
      interfaces: [
        {
          name: 'gi0/1',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [1],
          description: 'Uplink to Router'
        },
        {
          name: 'gi0/2',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [1],
          description: 'Office PC'
        },
        {
          name: 'gi0/3',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [1],
          description: 'Office PC'
        },
        {
          name: 'gi0/4',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [1],
          description: 'Printer'
        },
        {
          name: 'gi0/8',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'access',
          vlans: [1],
          description: 'Access Point'
        }
      ]
    },
    'access-point': {
      config: {
        hostname: 'OFFICE-AP-01',
        managementIp: '192.168.1.10'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '192.168.1.10',
          subnet: '255.255.255.0',
          description: 'LAN Connection'
        },
        {
          name: 'wlan0',
          type: 'wireless',
          status: 'up',
          mode: 'routed',
          description: 'Office WiFi'
        }
      ]
    },
    workstation: {
      config: {
        hostname: 'OFFICE-PC-01'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: 'DHCP',
          subnet: '',
          description: 'LAN Connection'
        }
      ]
    },
    server: {
      config: {
        hostname: 'OFFICE-NAS-01',
        managementIp: '192.168.1.20'
      },
      interfaces: [
        {
          name: 'eth0',
          type: 'ethernet',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '192.168.1.20',
          subnet: '255.255.255.0',
          description: 'LAN Connection'
        }
      ]
    }
  }
};

// ISP/キャリア向けテンプレート
export const ispTemplate: DeviceConfigTemplate = {
  version: '1.0',
  deviceConfigs: {
    router: {
      config: {
        hostname: 'ISP-PE-RTR-01',
        managementIp: '10.255.0.1'
      },
      interfaces: [
        {
          name: 'xe-0/0/0',
          type: 'fiber',
          speed: '100000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.0.0.1',
          subnet: '255.255.255.252',
          description: 'Core Network'
        },
        {
          name: 'xe-0/0/1',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.1.0.1',
          subnet: '255.255.255.252',
          description: 'Customer A'
        },
        {
          name: 'xe-0/0/2',
          type: 'fiber',
          speed: '10000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.2.0.1',
          subnet: '255.255.255.252',
          description: 'Customer B'
        },
        {
          name: 'xe-0/0/3',
          type: 'fiber',
          speed: '1000',
          status: 'up',
          mode: 'routed',
          ipAddress: '10.3.0.1',
          subnet: '255.255.255.252',
          description: 'IX Peering'
        }
      ]
    }
  }
};

// テンプレートのリスト
export const templates = [
  {
    id: 'enterprise',
    name: 'Enterprise Network',
    description: 'Standard enterprise network configuration with VLANs, DMZ, and multiple security zones',
    template: enterpriseTemplate
  },
  {
    id: 'datacenter',
    name: 'Data Center',
    description: 'High-performance data center configuration with 10G/40G fiber connections',
    template: datacenterTemplate
  },
  {
    id: 'small-office',
    name: 'Small Office',
    description: 'Simple office setup with basic routing, switching, and WiFi',
    template: smallOfficeTemplate
  },
  {
    id: 'isp',
    name: 'ISP/Carrier',
    description: 'Service provider configuration with high-speed backbone connections',
    template: ispTemplate
  }
];

export const getTemplateById = (id: string): DeviceConfigTemplate | undefined => {
  const found = templates.find(t => t.id === id);
  return found?.template;
};