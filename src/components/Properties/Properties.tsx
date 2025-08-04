import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import React, { useState } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { migrateDeviceToInterfaces } from '../../utils/migrationUtils';
import InterfacesSection from './InterfacesSection';

const Properties: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | false>('basic');
  const { 
    selectedDevice, 
    selectedConnection, 
    updateDevice, 
    updateConnection,
    selectDevice, 
    selectConnection,
    deleteDevice,
    deleteConnection,
    devices
  } = useDiagramStore();

  // Get the current device from devices array to ensure we have the latest data
  const currentDevice = React.useMemo(() => {
    if (!selectedDevice) return null;
    const device = devices.find(d => d.id === selectedDevice.id) || selectedDevice;
    // Migrate to new interface format if needed
    if (!device.interfaces || !Array.isArray(device.interfaces)) {
      return migrateDeviceToInterfaces(device);
    }
    return device;
  }, [devices, selectedDevice]);

  // Get source and target devices for the selected connection
  const connectionDevices = React.useMemo(() => {
    if (!selectedConnection) return null;
    
    const sourceDevice = devices.find(d => d.id === selectedConnection.source);
    const targetDevice = devices.find(d => d.id === selectedConnection.target);
    
    // Ensure devices have interfaces
    const migratedSource = sourceDevice && (!sourceDevice.interfaces || !Array.isArray(sourceDevice.interfaces)) 
      ? migrateDeviceToInterfaces(sourceDevice) 
      : sourceDevice;
    const migratedTarget = targetDevice && (!targetDevice.interfaces || !Array.isArray(targetDevice.interfaces)) 
      ? migrateDeviceToInterfaces(targetDevice) 
      : targetDevice;
    
    return {
      source: migratedSource,
      target: migratedTarget
    };
  }, [devices, selectedConnection]);

  if (!currentDevice && !selectedConnection) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          backgroundColor: 'background.paper',
          p: 2,
          pl: 5,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a device or connection to view properties
        </Typography>
      </Paper>
    );
  }

  const handleDeviceChange = (field: string, value: string) => {
    if (currentDevice) {
      updateDevice(currentDevice.id, {
        config: { ...currentDevice.config, [field]: value },
      });
    }
  };

  const handleNameChange = (value: string) => {
    if (currentDevice) {
      updateDevice(currentDevice.id, { name: value });
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      {currentDevice && (
        <Box sx={{ p: 2, pl: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Device Properties</Typography>
            <IconButton size="small" onClick={() => selectDevice(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            label="Name"
            value={currentDevice.name}
            onChange={(e) => handleNameChange(e.target.value)}
            margin="normal"
            size="small"
            onKeyDown={(e) => e.stopPropagation()}
          />
          
          <TextField
            fullWidth
            label="Type"
            value={currentDevice.type}
            margin="normal"
            size="small"
            disabled
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Accordion 
            expanded={expandedSection === 'basic'}
            onChange={(_, isExpanded) => setExpandedSection(isExpanded ? 'basic' : false)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Basic Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label="Hostname"
                value={currentDevice.config.hostname || ''}
                onChange={(e) => handleDeviceChange('hostname', e.target.value)}
                margin="normal"
                size="small"
                onKeyDown={(e) => e.stopPropagation()}
              />
              <TextField
                fullWidth
                label="Management IP"
                value={currentDevice.config.managementIp || ''}
                onChange={(e) => handleDeviceChange('managementIp', e.target.value)}
                margin="normal"
                size="small"
                placeholder="192.168.1.1"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </AccordionDetails>
          </Accordion>
          
          <Accordion
            expanded={expandedSection === 'interfaces'}
            onChange={(_, isExpanded) => setExpandedSection(isExpanded ? 'interfaces' : false)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Network Interfaces</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <InterfacesSection
                device={currentDevice}
                onUpdateDevice={(updates) => updateDevice(currentDevice.id, updates)}
              />
            </AccordionDetails>
          </Accordion>
          
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => {
              if (currentDevice) {
                deleteDevice(currentDevice.id);
                selectDevice(null);
              }
            }}
          >
            Delete Device
          </Button>
        </Box>
      )}
      
      {selectedConnection && (
        <Box sx={{ p: 2, pl: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Connection Properties</Typography>
            <IconButton size="small" onClick={() => selectConnection(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            label="Label"
            value={selectedConnection.label || ''}
            onChange={(e) => updateConnection(selectedConnection.id, { label: e.target.value })}
            margin="normal"
            size="small"
            onKeyDown={(e) => e.stopPropagation()}
          />
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Source Interface</InputLabel>
            <Select
              value={selectedConnection.sourceInterfaceId || 
                     (selectedConnection.sourcePort && connectionDevices?.source?.interfaces?.find(i => i.name === selectedConnection.sourcePort)?.id) || 
                     ''}
              onChange={(e) => {
                const interfaceId = e.target.value;
                const sourceInterface = connectionDevices?.source?.interfaces?.find(i => i.id === interfaceId);
                const targetInterfaceId = selectedConnection.targetInterfaceId || 
                  (selectedConnection.targetPort && connectionDevices?.target?.interfaces?.find(i => i.name === selectedConnection.targetPort)?.id);
                const targetInterface = targetInterfaceId ? connectionDevices?.target?.interfaces?.find(i => i.id === targetInterfaceId) : null;
                
                // 両方のインターフェースが選択されている場合、接続タイプを自動設定
                let connectionType = selectedConnection.type;
                if (sourceInterface && targetInterface) {
                  // 両方のインターフェースタイプが同じ場合はそのタイプを使用
                  if (sourceInterface.type === targetInterface.type) {
                    connectionType = sourceInterface.type;
                  }
                }
                
                updateConnection(selectedConnection.id, { 
                  sourceInterfaceId: interfaceId,
                  sourcePort: sourceInterface?.name || '', // 後方互換性のため
                  type: connectionType
                });
              }}
              label="Source Interface"
            >
              {connectionDevices?.source ? (
                connectionDevices.source.interfaces?.map((iface) => (
                  <MenuItem key={iface.id} value={iface.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{iface.name}</Typography>
                      <Typography variant="caption" color={iface.status === 'up' ? 'success.main' : 'text.secondary'}>
                        ({iface.status})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  <Typography variant="caption" color="text.secondary">No source device</Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Target Interface</InputLabel>
            <Select
              value={selectedConnection.targetInterfaceId || 
                     (selectedConnection.targetPort && connectionDevices?.target?.interfaces?.find(i => i.name === selectedConnection.targetPort)?.id) || 
                     ''}
              onChange={(e) => {
                const interfaceId = e.target.value;
                const targetInterface = connectionDevices?.target?.interfaces?.find(i => i.id === interfaceId);
                const sourceInterfaceId = selectedConnection.sourceInterfaceId || 
                  (selectedConnection.sourcePort && connectionDevices?.source?.interfaces?.find(i => i.name === selectedConnection.sourcePort)?.id);
                const sourceInterface = sourceInterfaceId ? connectionDevices?.source?.interfaces?.find(i => i.id === sourceInterfaceId) : null;
                
                // 両方のインターフェースが選択されている場合、接続タイプを自動設定
                let connectionType = selectedConnection.type;
                if (sourceInterface && targetInterface) {
                  // 両方のインターフェースタイプが同じ場合はそのタイプを使用
                  if (sourceInterface.type === targetInterface.type) {
                    connectionType = targetInterface.type;
                  }
                }
                
                updateConnection(selectedConnection.id, { 
                  targetInterfaceId: interfaceId,
                  targetPort: targetInterface?.name || '', // 後方互換性のため
                  type: connectionType
                });
              }}
              label="Target Interface"
            >
              {connectionDevices?.target ? (
                connectionDevices.target.interfaces?.map((iface) => (
                  <MenuItem key={iface.id} value={iface.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{iface.name}</Typography>
                      <Typography variant="caption" color={iface.status === 'up' ? 'success.main' : 'text.secondary'}>
                        ({iface.status})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  <Typography variant="caption" color="text.secondary">No target device</Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Connection Type"
            value={selectedConnection.type}
            margin="normal"
            size="small"
            disabled
            helperText="Automatically set based on selected interfaces"
          />
          
          <TextField
            fullWidth
            label="Bandwidth"
            value={selectedConnection.bandwidth || ''}
            onChange={(e) => updateConnection(selectedConnection.id, { bandwidth: e.target.value })}
            margin="normal"
            size="small"
            placeholder="1 Gbps"
            onKeyDown={(e) => e.stopPropagation()}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Connection Style
          </Typography>
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Line Style</InputLabel>
            <Select
              value={selectedConnection.style?.strokeStyle || 'solid'}
              onChange={(e) => updateConnection(selectedConnection.id, { 
                style: { 
                  strokeStyle: e.target.value as 'solid' | 'dashed' | 'dotted',
                  strokeColor: selectedConnection.style?.strokeColor || '#1976d2',
                  strokeWidth: selectedConnection.style?.strokeWidth || 2,
                  animated: selectedConnection.style?.animated || false
                } 
              })}
              label="Line Style"
            >
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="dashed">Dashed</MenuItem>
              <MenuItem value="dotted">Dotted</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Line Color"
            value={selectedConnection.style?.strokeColor || '#1976d2'}
            onChange={(e) => updateConnection(selectedConnection.id, { 
              style: { 
                strokeStyle: selectedConnection.style?.strokeStyle || 'solid',
                strokeColor: e.target.value,
                strokeWidth: selectedConnection.style?.strokeWidth || 2,
                animated: selectedConnection.style?.animated || false
              } 
            })}
            margin="normal"
            size="small"
            type="color"
            onKeyDown={(e) => e.stopPropagation()}
          />
          
          <TextField
            fullWidth
            label="Line Width"
            value={selectedConnection.style?.strokeWidth || 2}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 2;
              const strokeWidth = Math.max(1, Math.min(10, value));
              updateConnection(selectedConnection.id, { 
                style: { 
                  strokeStyle: selectedConnection.style?.strokeStyle || 'solid',
                  strokeColor: selectedConnection.style?.strokeColor || '#1976d2',
                  strokeWidth,
                  animated: selectedConnection.style?.animated || false
                } 
              });
            }}
            margin="normal"
            size="small"
            type="number"
            inputProps={{ min: 1, max: 10 }}
            onKeyDown={(e) => e.stopPropagation()}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={selectedConnection.style?.animated || false}
                onChange={(e) => updateConnection(selectedConnection.id, { 
                  style: { 
                    strokeStyle: selectedConnection.style?.strokeStyle || 'solid',
                    strokeColor: selectedConnection.style?.strokeColor || '#1976d2',
                    strokeWidth: selectedConnection.style?.strokeWidth || 2,
                    animated: e.target.checked 
                  } 
                })}
              />
            }
            label="Animated"
            sx={{ mt: 1 }}
          />
          
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => {
              if (selectedConnection) {
                deleteConnection(selectedConnection.id);
                selectConnection(null);
              }
            }}
          >
            Delete Connection
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default Properties;