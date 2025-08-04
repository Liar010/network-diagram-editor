import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import { useReactFlow } from '@xyflow/react';
import React from 'react';

const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <ButtonGroup size="small">
      <Tooltip title="Zoom In">
        <Button onClick={() => zoomIn()}>
          <ZoomInIcon />
        </Button>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <Button onClick={() => zoomOut()}>
          <ZoomOutIcon />
        </Button>
      </Tooltip>
      <Tooltip title="Fit to Screen">
        <Button onClick={() => fitView()}>
          <FitScreenIcon />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default ZoomControls;