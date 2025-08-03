import { NetworkDevice, Connection } from '../types/network';

export interface LayoutOptions {
  algorithm: 'hierarchical' | 'force' | 'circular' | 'grid';
  spacing: number;
  direction?: 'horizontal' | 'vertical';
  centerX?: number;
  centerY?: number;
}

export interface LayoutResult {
  devices: NetworkDevice[];
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * Hierarchical layout - arranges devices in layers based on their connections
 * Routers at top, switches in middle, end devices at bottom
 */
export const hierarchicalLayout = (
  devices: NetworkDevice[],
  connections: Connection[],
  options: LayoutOptions
): LayoutResult => {
  const { spacing = 150, direction = 'vertical' } = options;
  
  // Categorize devices by their type hierarchy
  const layers: { [key: number]: NetworkDevice[] } = {
    0: devices.filter(d => d.type === 'cloud'),
    1: devices.filter(d => d.type === 'router'),
    2: devices.filter(d => d.type === 'firewall'),
    3: devices.filter(d => ['switch', 'load-balancer'].includes(d.type)),
    4: devices.filter(d => ['server', 'workstation', 'access-point'].includes(d.type))
  };

  let layoutDevices: NetworkDevice[] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  Object.keys(layers).forEach((layerKey) => {
    const layerIndex = parseInt(layerKey);
    const layerDevices = layers[layerIndex];
    
    if (layerDevices.length === 0) return;

    // Calculate positions for devices in this layer
    const totalWidth = (layerDevices.length - 1) * spacing;
    const startX = -totalWidth / 2;

    layerDevices.forEach((device, index) => {
      const x = direction === 'horizontal' ? layerIndex * spacing : startX + index * spacing;
      const y = direction === 'horizontal' ? startX + index * spacing : layerIndex * spacing;

      const updatedDevice = {
        ...device,
        position: { x, y }
      };

      layoutDevices.push(updatedDevice);

      // Update bounding box
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  // Center the layout if center coordinates are provided
  if (options.centerX !== undefined || options.centerY !== undefined) {
    const currentCenterX = (minX + maxX) / 2;
    const currentCenterY = (minY + maxY) / 2;
    const offsetX = (options.centerX || currentCenterX) - currentCenterX;
    const offsetY = (options.centerY || currentCenterY) - currentCenterY;

    layoutDevices = layoutDevices.map(device => ({
      ...device,
      position: {
        x: device.position.x + offsetX,
        y: device.position.y + offsetY
      }
    }));

    minX += offsetX;
    minY += offsetY;
    maxX += offsetX;
    maxY += offsetY;
  }

  return {
    devices: layoutDevices,
    boundingBox: { minX, minY, maxX, maxY }
  };
};

/**
 * Force-directed layout using a simplified version of Fruchterman-Reingold algorithm
 */
export const forceDirectedLayout = (
  devices: NetworkDevice[],
  connections: Connection[],
  options: LayoutOptions
): LayoutResult => {
  const { spacing = 150 } = options;
  const iterations = 50;
  const k = spacing; // Optimal distance between nodes
  const temperature = spacing / 4;

  // Initialize positions if not set
  let layoutDevices = devices.map((device, index) => ({
    ...device,
    position: device.position.x !== undefined && device.position.y !== undefined 
      ? device.position 
      : {
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200
        }
  }));

  // Create adjacency list for connected devices
  const adjacencyList = new Map<string, string[]>();
  devices.forEach(device => adjacencyList.set(device.id, []));
  
  connections.forEach(conn => {
    adjacencyList.get(conn.source)?.push(conn.target);
    adjacencyList.get(conn.target)?.push(conn.source);
  });

  // Force-directed algorithm with max iterations safety
  const maxIterations = Math.min(iterations, 1000); // Safety limit
  for (let iter = 0; iter < maxIterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();
    
    // Initialize forces
    layoutDevices.forEach(device => {
      forces.set(device.id, { x: 0, y: 0 });
    });

    // Calculate repulsive forces between all pairs
    for (let i = 0; i < layoutDevices.length; i++) {
      for (let j = i + 1; j < layoutDevices.length; j++) {
        const device1 = layoutDevices[i];
        const device2 = layoutDevices[j];
        
        const dx = device1.position.x - device2.position.x;
        const dy = device1.position.y - device2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const repulsiveForce = (k * k) / distance;
        const fx = (dx / distance) * repulsiveForce;
        const fy = (dy / distance) * repulsiveForce;
        
        const force1 = forces.get(device1.id)!;
        const force2 = forces.get(device2.id)!;
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      }
    }

    // Calculate attractive forces for connected devices
    connections.forEach(conn => {
      const device1 = layoutDevices.find(d => d.id === conn.source);
      const device2 = layoutDevices.find(d => d.id === conn.target);
      
      if (!device1 || !device2) return;
      
      const dx = device2.position.x - device1.position.x;
      const dy = device2.position.y - device1.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const attractiveForce = (distance * distance) / k;
      const fx = (dx / distance) * attractiveForce;
      const fy = (dy / distance) * attractiveForce;
      
      const force1 = forces.get(device1.id)!;
      const force2 = forces.get(device2.id)!;
      
      force1.x += fx;
      force1.y += fy;
      force2.x -= fx;
      force2.y -= fy;
    });

    // Apply forces with cooling
    const coolingFactor = 1 - iter / iterations;
    const currentTemperature = temperature * coolingFactor;
    
    layoutDevices = layoutDevices.map(device => {
      const force = forces.get(device.id)!;
      const forceLength = Math.sqrt(force.x * force.x + force.y * force.y) || 1;
      
      const displacement = Math.min(forceLength, currentTemperature);
      
      return {
        ...device,
        position: {
          x: device.position.x + (force.x / forceLength) * displacement,
          y: device.position.y + (force.y / forceLength) * displacement
        }
      };
    });
  }

  // Calculate bounding box
  const positions = layoutDevices.map(d => d.position);
  const minX = Math.min(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxX = Math.max(...positions.map(p => p.x));
  const maxY = Math.max(...positions.map(p => p.y));

  return {
    devices: layoutDevices,
    boundingBox: { minX, minY, maxX, maxY }
  };
};

/**
 * Circular layout - arranges devices in a circle
 */
export const circularLayout = (
  devices: NetworkDevice[],
  connections: Connection[],
  options: LayoutOptions
): LayoutResult => {
  const { spacing = 150, centerX = 0, centerY = 0 } = options;
  const radius = (devices.length * spacing) / (2 * Math.PI);
  
  const layoutDevices = devices.map((device, index) => {
    const angle = (2 * Math.PI * index) / devices.length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return {
      ...device,
      position: { x, y }
    };
  });

  const minX = centerX - radius;
  const minY = centerY - radius;
  const maxX = centerX + radius;
  const maxY = centerY + radius;

  return {
    devices: layoutDevices,
    boundingBox: { minX, minY, maxX, maxY }
  };
};

/**
 * Grid layout - arranges devices in a regular grid
 */
export const gridLayout = (
  devices: NetworkDevice[],
  connections: Connection[],
  options: LayoutOptions
): LayoutResult => {
  const { spacing = 150, centerX = 0, centerY = 0 } = options;
  const cols = Math.ceil(Math.sqrt(devices.length));
  const rows = Math.ceil(devices.length / cols);
  
  const totalWidth = (cols - 1) * spacing;
  const totalHeight = (rows - 1) * spacing;
  const startX = centerX - totalWidth / 2;
  const startY = centerY - totalHeight / 2;

  const layoutDevices = devices.map((device, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = startX + col * spacing;
    const y = startY + row * spacing;
    
    return {
      ...device,
      position: { x, y }
    };
  });

  return {
    devices: layoutDevices,
    boundingBox: {
      minX: startX,
      minY: startY,
      maxX: startX + totalWidth,
      maxY: startY + totalHeight
    }
  };
};

/**
 * Calculate bounding box for a set of devices
 */
const calculateBoundingBox = (devices: NetworkDevice[]) => {
  if (devices.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  devices.forEach(device => {
    minX = Math.min(minX, device.position.x);
    minY = Math.min(minY, device.position.y);
    maxX = Math.max(maxX, device.position.x);
    maxY = Math.max(maxY, device.position.y);
  });

  return { minX, minY, maxX, maxY };
};

/**
 * Main layout function that delegates to specific algorithms
 */
export const applyLayout = (
  devices: NetworkDevice[],
  connections: Connection[],
  options: LayoutOptions
): LayoutResult => {
  try {
    if (devices.length === 0) {
      return {
        devices: [],
        boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
      };
    }

    // Validate and sanitize options
    const validatedOptions = {
      ...options,
      spacing: Math.max(50, Math.min(500, options.spacing || 150)), // Clamp spacing
    };

    switch (options.algorithm) {
      case 'hierarchical':
        return hierarchicalLayout(devices, connections, validatedOptions);
      case 'force':
        return forceDirectedLayout(devices, connections, validatedOptions);
      case 'circular':
        return circularLayout(devices, connections, validatedOptions);
      case 'grid':
        return gridLayout(devices, connections, validatedOptions);
      default:
        throw new Error(`Unknown layout algorithm: ${options.algorithm}`);
    }
  } catch (error) {
    console.error('Layout algorithm failed:', error);
    // Return original devices with bounding box if layout fails
    return {
      devices,
      boundingBox: calculateBoundingBox(devices)
    };
  }
};