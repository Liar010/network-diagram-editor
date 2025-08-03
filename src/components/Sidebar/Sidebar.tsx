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
import {
  Box,
  Paper,
  Typography,
  List,
  Divider,
} from '@mui/material';
import React from 'react';
import { DeviceType } from '../../types/network';
import DraggableDevice from './DraggableDevice';

interface DeviceTemplate {
  type: DeviceType;
  label: string;
  icon: React.ReactElement;
}

const deviceTemplates: DeviceTemplate[] = [
  { type: 'router', label: 'Router', icon: <RouterIcon /> },
  { type: 'switch', label: 'Switch', icon: <SwitchIcon /> },
  { type: 'firewall', label: 'Firewall', icon: <FirewallIcon /> },
  { type: 'server', label: 'Server', icon: <ServerIcon /> },
  { type: 'load-balancer', label: 'Load Balancer', icon: <LoadBalancerIcon /> },
  { type: 'cloud', label: 'Cloud', icon: <CloudIcon /> },
  { type: 'workstation', label: 'Workstation', icon: <WorkstationIcon /> },
  { type: 'access-point', label: 'Access Point', icon: <AccessPointIcon /> },
];

const Sidebar: React.FC = () => {
  return (
    <Paper
      component="aside"
      role="complementary"
      aria-label="Network device palette"
      elevation={2}
      sx={{
        width: 240,
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Network Devices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop to canvas
        </Typography>
      </Box>
      <Divider />
      <List>
        {deviceTemplates.map((device) => (
          <DraggableDevice key={device.type} device={device} />
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;