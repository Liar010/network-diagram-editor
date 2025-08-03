import {
  Router as RouterIcon,
  Hub as SwitchIcon,
  Security as FirewallIcon,
  Storage as ServerIcon,
  Cloud as CloudIcon,
  Computer as WorkstationIcon,
  Wifi as AccessPointIcon,
  Balance as LoadBalancerIcon,
} from '@mui/icons-material';
import { Box, Typography, Paper } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { getDeviceDisplayInfo } from '../../utils/layerUtils';

const deviceIcons = {
  router: RouterIcon,
  switch: SwitchIcon,
  firewall: FirewallIcon,
  server: ServerIcon,
  'load-balancer': LoadBalancerIcon,
  cloud: CloudIcon,
  workstation: WorkstationIcon,
  'access-point': AccessPointIcon,
};

const NetworkDeviceNode: React.FC<any> = ({ data, selected }) => {
  const { selectDevice, layer } = useDiagramStore();
  const device = data.device;
  const Icon = deviceIcons[device.type as keyof typeof deviceIcons];
  const displayInfo = getDeviceDisplayInfo(device, layer);

  const handleClick = () => {
    selectDevice(device);
  };

  return (
    <Paper
      elevation={selected ? 4 : 2}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${device.type} device: ${device.name}`}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      sx={{
        padding: 2,
        cursor: 'pointer',
        border: selected ? '2px solid #1976d2' : 'none',
        backgroundColor: 'background.paper',
        '&:hover': {
          boxShadow: 4,
        },
        '&:focus': {
          outline: '2px solid #1976d2',
          outlineOffset: 2,
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        {displayInfo.map((info, index) => (
          <Typography 
            key={index} 
            variant={index === 0 ? "body2" : "caption"} 
            color={index === 0 ? "text.primary" : "text.secondary"}
            noWrap
            sx={{ maxWidth: 120 }}
          >
            {info}
          </Typography>
        ))}
      </Box>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export default NetworkDeviceNode;