import {
  Box,
} from '@mui/material';
import React from 'react';
import { useDrag } from 'react-dnd';
import { DeviceType } from '../../types/network';

interface DraggableDeviceProps {
  device: {
    type: DeviceType;
    label: string;
    icon: React.ReactElement;
  };
}

const DraggableDevice: React.FC<DraggableDeviceProps> = ({ device }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'network-device',
    item: { type: device.type, label: device.label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag as any}
      component="li"
      role="listitem"
      aria-label={`Draggable ${device.label} device`}
      tabIndex={0}
      sx={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&:focus': {
          backgroundColor: 'action.hover',
          outline: '2px solid #1976d2',
          outlineOffset: -2,
        },
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ marginRight: 2, display: 'flex', alignItems: 'center' }}>{device.icon}</Box>
      <Box>{device.label}</Box>
    </Box>
  );
};

export default DraggableDevice;