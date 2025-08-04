import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import { NetworkDevice, NetworkInterface } from '../../types/network';
import { generateId } from '../../utils/idGenerator';

interface InterfacesSectionProps {
  device: NetworkDevice;
  onUpdateDevice: (updates: Partial<NetworkDevice>) => void;
}

const InterfacesSection: React.FC<InterfacesSectionProps> = ({ device, onUpdateDevice }) => {
  const [expandedInterface, setExpandedInterface] = useState<string | false>(false);

  const handleInterfaceChange = (interfaceId: string, field: keyof NetworkInterface, value: any) => {
    const updatedInterfaces = device.interfaces.map(intf =>
      intf.id === interfaceId ? { ...intf, [field]: value } : intf
    );
    onUpdateDevice({ interfaces: updatedInterfaces });
  };

  const handleAddInterface = () => {
    const newInterface: NetworkInterface = {
      id: generateId('intf'),
      name: `eth${device.interfaces.length}`,
      type: 'ethernet',
      status: 'down',
      speed: '1000',
      mode: 'access',
    };
    onUpdateDevice({ interfaces: [...device.interfaces, newInterface] });
  };

  const handleDeleteInterface = (interfaceId: string) => {
    const updatedInterfaces = device.interfaces.filter(intf => intf.id !== interfaceId);
    onUpdateDevice({ interfaces: updatedInterfaces });
  };

  const handleVlanChange = (interfaceId: string, vlansString: string) => {
    const vlans = vlansString
      .split(',')
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v > 0 && v <= 4094);
    handleInterfaceChange(interfaceId, 'vlans', vlans);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      case 'admin-down':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          Network Interfaces ({device.interfaces.length})
        </Typography>
        <Tooltip title="Add Interface">
          <IconButton size="small" onClick={handleAddInterface}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {device.interfaces.map((intf) => (
        <Accordion
          key={intf.id}
          expanded={expandedInterface === intf.id}
          onChange={(_, isExpanded) => setExpandedInterface(isExpanded ? intf.id : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <CircleIcon sx={{ fontSize: 12, color: getStatusColor(intf.status) }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {intf.name}
              </Typography>
              {intf.ipAddress && (
                <Chip
                  label={intf.ipAddress}
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
              {intf.vlans && intf.vlans.length > 0 && (
                <Chip
                  label={`VLAN ${intf.vlans.join(',')}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                label="Interface Name"
                value={intf.name}
                onChange={(e) => handleInterfaceChange(intf.id, 'name', e.target.value)}
                size="small"
                onKeyDown={(e) => e.stopPropagation()}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={intf.type}
                  onChange={(e) => handleInterfaceChange(intf.id, 'type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="ethernet">Ethernet</MenuItem>
                  <MenuItem value="fiber">Fiber</MenuItem>
                  <MenuItem value="serial">Serial</MenuItem>
                  <MenuItem value="wireless">Wireless</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={intf.status}
                  onChange={(e) => handleInterfaceChange(intf.id, 'status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="up">Up</MenuItem>
                  <MenuItem value="down">Down</MenuItem>
                  <MenuItem value="admin-down">Admin Down</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Port Mode</InputLabel>
                <Select
                  value={intf.mode || 'access'}
                  onChange={(e) => handleInterfaceChange(intf.id, 'mode', e.target.value)}
                  label="Port Mode"
                >
                  <MenuItem value="access">Access</MenuItem>
                  <MenuItem value="trunk">Trunk</MenuItem>
                  <MenuItem value="routed">Routed</MenuItem>
                </Select>
              </FormControl>

              {(intf.mode === 'routed' || !intf.mode) && (
                <>
                  <TextField
                    fullWidth
                    label="IP Address"
                    value={intf.ipAddress || ''}
                    onChange={(e) => handleInterfaceChange(intf.id, 'ipAddress', e.target.value)}
                    size="small"
                    placeholder="192.168.1.1"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <TextField
                    fullWidth
                    label="Subnet Mask"
                    value={intf.subnet || ''}
                    onChange={(e) => handleInterfaceChange(intf.id, 'subnet', e.target.value)}
                    size="small"
                    placeholder="255.255.255.0"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </>
              )}

              {(intf.mode === 'access' || intf.mode === 'trunk') && (
                <TextField
                  fullWidth
                  label={intf.mode === 'trunk' ? 'VLANs (comma-separated)' : 'VLAN'}
                  value={intf.vlans?.join(',') || ''}
                  onChange={(e) => handleVlanChange(intf.id, e.target.value)}
                  size="small"
                  placeholder={intf.mode === 'trunk' ? '10,20,30' : '10'}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              )}

              <TextField
                fullWidth
                label="Speed (Mbps)"
                value={intf.speed || ''}
                onChange={(e) => handleInterfaceChange(intf.id, 'speed', e.target.value)}
                size="small"
                placeholder="1000"
                onKeyDown={(e) => e.stopPropagation()}
              />

              <TextField
                fullWidth
                label="Description"
                value={intf.description || ''}
                onChange={(e) => handleInterfaceChange(intf.id, 'description', e.target.value)}
                size="small"
                multiline
                rows={2}
                placeholder="Interface description"
                onKeyDown={(e) => e.stopPropagation()}
              />

              {intf.connectedTo && (
                <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Connected to: Device {intf.connectedTo.deviceId} - {intf.connectedTo.interfaceId}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteInterface(intf.id)}
                disabled={device.interfaces.length <= 1 || !!intf.connectedTo}
              >
                Delete Interface
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default InterfacesSection;