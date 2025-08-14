import {
  Router as RouterIcon,
  Hub as SwitchIcon,
  Security as FirewallIcon,
  Storage as ServerIcon,
  Cloud as CloudIcon,
  Computer as WorkstationIcon,
  Wifi as AccessPointIcon,
  Balance as LoadBalancerIcon,
  TextFields as TextFieldsIcon,
  Note as NoteIcon,
  CropDin as CropDinIcon,
  CropFree as CropFreeIcon,
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
import { AnnotationType } from '../../types/annotation';
import DraggableDevice from './DraggableDevice';
import DraggableAnnotation from './DraggableAnnotation';

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

interface AnnotationTemplate {
  type: AnnotationType;
  label: string;
  icon: React.ReactElement;
}

const annotationTemplates: AnnotationTemplate[] = [
  { type: 'text-note', label: 'Text Note', icon: <TextFieldsIcon /> },
  { type: 'sticky', label: 'Sticky Note', icon: <NoteIcon /> },
];

const Sidebar: React.FC = () => {
  return (
    <Paper
      component="aside"
      role="complementary"
      aria-label="Network device palette"
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, pr: 5 }}>
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
      
      <Divider sx={{ mt: 2, mb: 2 }} />
      
      <Box sx={{ p: 2, pr: 5 }}>
        <Typography variant="h6" gutterBottom>
          Annotations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add notes and areas
        </Typography>
      </Box>
      
      <List>
        {annotationTemplates.map((annotation) => (
          <DraggableAnnotation 
            key={annotation.type} 
            type={annotation.type}
            label={annotation.label}
            icon={annotation.icon}
          />
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;