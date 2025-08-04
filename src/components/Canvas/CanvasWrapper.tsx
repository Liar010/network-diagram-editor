import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import Canvas from './Canvas';

const CanvasWrapper: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
};

export default CanvasWrapper;