import React, { useState } from 'react';
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
                  <TableCell>IP Address</TableCell>
                  <TableCell>Subnet</TableCell>
                  <TableCell>VLAN</TableCell>
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
                    <TableCell>{device.config.ipAddress || '-'}</TableCell>
                    <TableCell>{device.config.subnet || '-'}</TableCell>
                    <TableCell>{device.config.vlan || '-'}</TableCell>
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
            This table shows all network connections that will be exported to CSV
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Source Device</TableCell>
                  <TableCell>Target Device</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Source Port</TableCell>
                  <TableCell>Target Port</TableCell>
                  <TableCell>Bandwidth</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id} hover>
                    <TableCell>{connection.id}</TableCell>
                    <TableCell>{getDeviceName(connection.source)}</TableCell>
                    <TableCell>{getDeviceName(connection.target)}</TableCell>
                    <TableCell>{connection.type}</TableCell>
                    <TableCell>{connection.label || '-'}</TableCell>
                    <TableCell>{connection.sourcePort || '-'}</TableCell>
                    <TableCell>{connection.targetPort || '-'}</TableCell>
                    <TableCell>{connection.bandwidth || '-'}</TableCell>
                  </TableRow>
                ))}
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