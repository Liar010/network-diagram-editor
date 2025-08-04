import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { NetworkDevice, Connection } from '../../types/network';
import { exportToCSV } from '../../utils/exportUtils';

interface ExportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  devices: NetworkDevice[];
  connections: Connection[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ExportPreviewDialog: React.FC<ExportPreviewDialogProps> = ({
  open,
  onClose,
  devices,
  connections,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = () => {
    exportToCSV(devices, connections);
    onClose();
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.name || deviceId;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Export Preview</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="export preview tabs">
          <Tab label={`Devices (${devices.length})`} />
          <Tab label={`Interfaces (${devices.reduce((acc, d) => acc + (d.interfaces?.length || 0), 0)})`} />
          <Tab label={`Connections (${connections.length})`} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This table shows all network devices that will be exported to CSV
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Management IP</TableCell>
                  <TableCell>Hostname</TableCell>
                  <TableCell>Position X</TableCell>
                  <TableCell>Position Y</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} hover>
                    <TableCell>{device.id}</TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>{device.config.managementIp || '-'}</TableCell>
                    <TableCell>{device.config.hostname || '-'}</TableCell>
                    <TableCell>{Math.round(device.position.x)}</TableCell>
                    <TableCell>{Math.round(device.position.y)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This table shows all network interfaces that will be exported to CSV
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Device Name</TableCell>
                  <TableCell>Interface Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Subnet</TableCell>
                  <TableCell>VLANs</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Speed</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.flatMap((device) => 
                  (device.interfaces || []).map((iface) => (
                    <TableRow key={`${device.id}-${iface.id}`} hover>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{iface.name}</TableCell>
                      <TableCell>{iface.type}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={iface.status === 'up' ? 'success.main' : 'text.secondary'}
                        >
                          {iface.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{iface.ipAddress || '-'}</TableCell>
                      <TableCell>{iface.subnet || '-'}</TableCell>
                      <TableCell>{iface.vlans?.join(', ') || '-'}</TableCell>
                      <TableCell>{iface.mode || '-'}</TableCell>
                      <TableCell>{iface.speed || '-'}</TableCell>
                      <TableCell>{iface.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This table shows all network connections that will be exported to CSV
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Source Device</TableCell>
                  <TableCell>Source Interface</TableCell>
                  <TableCell>Target Device</TableCell>
                  <TableCell>Target Interface</TableCell>
                  <TableCell>Connection Type</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Bandwidth</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection) => {
                  const sourceDevice = devices.find(d => d.id === connection.source);
                  const targetDevice = devices.find(d => d.id === connection.target);
                  
                  let sourceInterfaceName = connection.sourcePort || '-';
                  let targetInterfaceName = connection.targetPort || '-';
                  
                  if (connection.sourceInterfaceId && sourceDevice?.interfaces) {
                    const sourceInterface = sourceDevice.interfaces.find(i => i.id === connection.sourceInterfaceId);
                    if (sourceInterface) {
                      sourceInterfaceName = sourceInterface.name;
                    }
                  }
                  
                  if (connection.targetInterfaceId && targetDevice?.interfaces) {
                    const targetInterface = targetDevice.interfaces.find(i => i.id === connection.targetInterfaceId);
                    if (targetInterface) {
                      targetInterfaceName = targetInterface.name;
                    }
                  }
                  
                  return (
                    <TableRow key={connection.id} hover>
                      <TableCell>{connection.id}</TableCell>
                      <TableCell>{getDeviceName(connection.source)}</TableCell>
                      <TableCell>{sourceInterfaceName}</TableCell>
                      <TableCell>{getDeviceName(connection.target)}</TableCell>
                      <TableCell>{targetInterfaceName}</TableCell>
                      <TableCell>{connection.type}</TableCell>
                      <TableCell>{connection.label || '-'}</TableCell>
                      <TableCell>{connection.bandwidth || '-'}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={connection.style?.animated ? 'success.main' : 'text.secondary'}
                        >
                          {connection.style?.animated ? 'Active' : 'Normal'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" color="primary">
          Export to CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportPreviewDialog;