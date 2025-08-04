import { Box } from '@mui/material';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import React, { useCallback, useRef, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import '@xyflow/react/dist/style.css';
import { useDiagramStore } from '../../store/diagramStore';
import { DeviceType } from '../../types/network';
import { NetworkNode, NetworkEdge } from '../../types/reactflow';
import { snapToGrid } from '../../utils/gridUtils';
import { getConnectionDisplayInfo, getConnectionStyleForLayer } from '../../utils/layerUtils';
import { createDeviceWithInterfaces } from '../../utils/migrationUtils';
import MemoizedNetworkDeviceNode from './MemoizedNetworkDeviceNode';

const Canvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { devices, connections, addDevice, addConnection, updateDevice, selectConnection, layer, gridEnabled, gridSize, setReactFlowInstance } = useDiagramStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<NetworkEdge>([]);
  const [reactFlowInstance, setReactFlowInstanceLocal] = React.useState<ReactFlowInstance<NetworkNode, NetworkEdge> | null>(null);

  // Memoize node types to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    networkDevice: MemoizedNetworkDeviceNode,
  }), []);

  React.useEffect(() => {
    const flowNodes: NetworkNode[] = devices.map((device) => ({
      id: device.id,
      type: 'networkDevice',
      position: device.position,
      data: { device },
    }));
    setNodes(flowNodes);
  }, [devices, setNodes]);

  React.useEffect(() => {
    const flowEdges: NetworkEdge[] = connections.map((conn) => {
      // Get layer-specific display info and styles
      const label = getConnectionDisplayInfo(conn, layer);
      const layerStyle = getConnectionStyleForLayer(conn, layer);
      
      return {
        id: conn.id,
        source: conn.source,
        target: conn.target,
        label,
        type: layerStyle.animated ? 'smoothstep' : 'default',
        animated: layerStyle.animated || false,
        style: {
          stroke: layerStyle.strokeColor || '#1976d2',
          strokeWidth: layerStyle.strokeWidth || 2,
          strokeDasharray: layerStyle.strokeStyle === 'dashed' ? '5 5' : 
                          layerStyle.strokeStyle === 'dotted' ? '2 2' : 
                          undefined,
        },
        labelStyle: {
          fill: '#555',
          fontWeight: 500,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8,
        },
      };
    });
    setEdges(flowEdges);
  }, [connections, layer, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addConnection({
          source: params.source,
          target: params.target,
          type: 'ethernet',
        });
      }
    },
    [addConnection]
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'network-device',
    drop: (item: { type: DeviceType; label: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        let position = reactFlowInstance.screenToFlowPosition({
          x: clientOffset.x - reactFlowBounds.left,
          y: clientOffset.y - reactFlowBounds.top,
        });
        
        // Apply grid snap if enabled
        if (gridEnabled) {
          position = snapToGrid(position, gridSize);
        }

        const newDevice = createDeviceWithInterfaces({
          type: item.type,
          name: `${item.label} ${devices.length + 1}`,
          position,
          config: {},
        });
        addDevice(newDevice);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [addDevice, devices.length, reactFlowInstance]);

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: any) => {
      let position = node.position;
      
      // Apply grid snap if enabled
      if (gridEnabled) {
        position = snapToGrid(position, gridSize);
      }
      
      updateDevice(node.id, { position });
    },
    [updateDevice, gridEnabled, gridSize]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: NetworkEdge) => {
      const connection = connections.find(conn => conn.id === edge.id);
      if (connection) {
        selectConnection(connection);
      }
    },
    [connections, selectConnection]
  );

  return (
    <Box
      ref={(el: HTMLDivElement | null) => {
        drop(el);
        if (el) {
          reactFlowWrapper.current = el;
        }
      }}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: isOver ? 'action.hover' : 'background.default',
      }}
    >
        <ReactFlow
          id="react-flow-canvas"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            setReactFlowInstanceLocal(instance);
            setReactFlowInstance(instance);
            // Force an initial update to ensure the instance is available
            setTimeout(() => {
              setReactFlowInstance(instance);
            }, 100);
          }}
          onNodeDragStop={onNodeDragStop}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={gridEnabled}
          snapGrid={[gridSize, gridSize]}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
        >
          <Controls />
          <MiniMap />
          <Background 
            variant={gridEnabled ? BackgroundVariant.Dots : BackgroundVariant.Cross} 
            gap={gridSize} 
            size={1} 
          />
        </ReactFlow>
    </Box>
  );
};

export default Canvas;