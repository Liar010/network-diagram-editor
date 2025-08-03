import React from 'react';
import NetworkDeviceNode from './NetworkDeviceNode';
import { NetworkNodeData } from '../../types/reactflow';

// Memoized version of NetworkDeviceNode for better performance
const MemoizedNetworkDeviceNode = React.memo(
  NetworkDeviceNode,
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if device data changes
    const prevDevice = prevProps.data.device;
    const nextDevice = nextProps.data.device;
    
    return (
      prevDevice.id === nextDevice.id &&
      prevDevice.name === nextDevice.name &&
      prevDevice.type === nextDevice.type &&
      prevDevice.position.x === nextDevice.position.x &&
      prevDevice.position.y === nextDevice.position.y &&
      JSON.stringify(prevDevice.config) === JSON.stringify(nextDevice.config) &&
      prevProps.selected === nextProps.selected
    );
  }
);

MemoizedNetworkDeviceNode.displayName = 'MemoizedNetworkDeviceNode';

export default MemoizedNetworkDeviceNode;