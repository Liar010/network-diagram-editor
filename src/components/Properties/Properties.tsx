import { Close as CloseIcon } from '@mui/icons-material';
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
} from '@mui/material';
import React from 'react';
import { useDiagramStore } from '../../store/diagramStore';

const Properties: React.FC = () => {
  const { 
    selectedDevice, 
    selectedConnection, 
    updateDevice, 
    updateConnection,
    selectDevice, 
    selectConnection,
    deleteDevice,
    deleteConnection
  } = useDiagramStore();

  if (!selectedDevice && !selectedConnection) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: 300,
          height: '100%',
          overflow: 'auto',
          backgroundColor: 'background.paper',
          p: 2,
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
    if (selectedDevice) {
      updateDevice(selectedDevice.id, {
        config: { ...selectedDevice.config, [field]: value },
      });
    }
  };

  const handleNameChange = (value: string) => {
    if (selectedDevice) {
      updateDevice(selectedDevice.id, { name: value });
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      {selectedDevice && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Device Properties</Typography>
            <IconButton size="small" onClick={() => selectDevice(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            label="Name"
            value={selectedDevice.name}
            onChange={(e) => handleNameChange(e.target.value)}
            margin="normal"
            size="small"
          />
          
          <TextField
            fullWidth
            label="Type"
            value={selectedDevice.type}
            margin="normal"
            size="small"
            disabled
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Network Configuration
          </Typography>
          
          <TextField
            fullWidth
            label="IP Address"
            value={selectedDevice.config.ipAddress || ''}
            onChange={(e) => handleDeviceChange('ipAddress', e.target.value)}
            margin="normal"
            size="small"
            placeholder="192.168.1.1"
          />
          
          <TextField
            fullWidth
            label="Subnet Mask"
            value={selectedDevice.config.subnet || ''}
            onChange={(e) => handleDeviceChange('subnet', e.target.value)}
            margin="normal"
            size="small"
            placeholder="255.255.255.0"
          />
          
          <TextField
            fullWidth
            label="VLAN"
            value={selectedDevice.config.vlan || ''}
            onChange={(e) => handleDeviceChange('vlan', e.target.value)}
            margin="normal"
            size="small"
            placeholder="10"
          />
          
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => {
              if (selectedDevice) {
                deleteDevice(selectedDevice.id);
                selectDevice(null);
              }
            }}
          >
            Delete Device
          </Button>
        </Box>
      )}
      
      {selectedConnection && (
        <Box sx={{ p: 2 }}>
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
          />
          
          <TextField
            fullWidth
            label="Source Port"
            value={selectedConnection.sourcePort || ''}
            onChange={(e) => updateConnection(selectedConnection.id, { sourcePort: e.target.value })}
            margin="normal"
            size="small"
            placeholder="Gi0/1"
          />
          
          <TextField
            fullWidth
            label="Target Port"
            value={selectedConnection.targetPort || ''}
            onChange={(e) => updateConnection(selectedConnection.id, { targetPort: e.target.value })}
            margin="normal"
            size="small"
            placeholder="Gi0/2"
          />
          
          <TextField
            fullWidth
            label="Bandwidth"
            value={selectedConnection.bandwidth || ''}
            onChange={(e) => updateConnection(selectedConnection.id, { bandwidth: e.target.value })}
            margin="normal"
            size="small"
            placeholder="1 Gbps"
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