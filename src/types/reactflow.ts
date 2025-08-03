import { Node, Edge, NodeProps } from '@xyflow/react';
import { NetworkDevice } from './network';

// Custom node data type for React Flow
export interface NetworkNodeData {
  device: NetworkDevice;
  [key: string]: unknown;
}

// Custom node type
export type NetworkNode = Node<NetworkNodeData, 'networkDevice'>;

// Custom edge type
export type NetworkEdge = Edge<Record<string, unknown>>;

// Props for custom node component
export type NetworkDeviceNodeProps = NodeProps<any>;