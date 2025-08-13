import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  Info as InfoIcon,
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
  Alert,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { NetworkDevice, NetworkInterface, Connection } from '../../types/network';
import { generateId } from '../../utils/idGenerator';
import { determineLinkStatus, getConnectionStyleFromLinkStatus, determineInterfaceStatus } from '../../utils/linkStatusUtils';

interface InterfacesSectionProps {
  device: NetworkDevice;
  onUpdateDevice: (updates: Partial<NetworkDevice>) => void;
}

const InterfacesSection: React.FC<InterfacesSectionProps> = ({ device, onUpdateDevice }) => {
  const [expandedInterface, setExpandedInterface] = useState<string | false>(false);
  const { connections, devices, updateConnection, updateDevice } = useDiagramStore();

  // インターフェース設定変更時に接続のステータスも更新
  const handleInterfaceChange = (interfaceId: string, field: keyof NetworkInterface, value: any) => {
    const updatedInterfaces = device.interfaces.map(intf =>
      intf.id === interfaceId ? { ...intf, [field]: value } : intf
    );
    onUpdateDevice({ interfaces: updatedInterfaces });
    
    // 影響を受ける接続を更新（type, speed, statusの変更時）
    if (field === 'type' || field === 'speed' || field === 'status') {
      updateRelatedConnections(interfaceId, field, value);
    }
  };
  
  // 関連する接続のステータスを更新
  const updateRelatedConnections = (interfaceId: string, field: keyof NetworkInterface, value: any) => {
    connections.forEach(conn => {
      let shouldUpdate = false;
      let sourceInterface: NetworkInterface | undefined;
      let targetInterface: NetworkInterface | undefined;
      
      // この接続がこのインターフェースを使用しているか確認
      if (conn.source === device.id && conn.sourceInterfaceId === interfaceId) {
        sourceInterface = device.interfaces.find(i => i.id === interfaceId);
        if (sourceInterface) {
          sourceInterface = { ...sourceInterface, [field]: value };
        }
        const targetDevice = devices.find(d => d.id === conn.target);
        targetInterface = targetDevice?.interfaces.find(i => i.id === conn.targetInterfaceId);
        shouldUpdate = true;
      } else if (conn.target === device.id && conn.targetInterfaceId === interfaceId) {
        targetInterface = device.interfaces.find(i => i.id === interfaceId);
        if (targetInterface) {
          targetInterface = { ...targetInterface, [field]: value };
        }
        const sourceDevice = devices.find(d => d.id === conn.source);
        sourceInterface = sourceDevice?.interfaces.find(i => i.id === conn.sourceInterfaceId);
        shouldUpdate = true;
      }
      
      if (shouldUpdate && sourceInterface && targetInterface) {
        // 両方のインターフェースが選択されているかチェック
        const bothInterfacesSelected = !!(conn.sourceInterfaceId && conn.targetInterfaceId);
        
        // Admin Downでない限り、ステータスを自動判定
        if (field === 'status' && value !== 'admin-down') {
          // 相手側のインターフェースステータスも更新
          const otherInterface = conn.source === device.id ? targetInterface : sourceInterface;
          const otherDevice = devices.find(d => 
            d.id === (conn.source === device.id ? conn.target : conn.source)
          );
          
          if (otherDevice && otherInterface && otherInterface.status !== 'admin-down') {
            const newStatus = determineInterfaceStatus(
              otherInterface, 
              { ...device.interfaces.find(i => i.id === interfaceId)!, [field]: value },
              bothInterfacesSelected
            );
            const updatedInterfaces = otherDevice.interfaces.map(intf =>
              intf.id === otherInterface.id ? { ...intf, status: newStatus } : intf
            );
            updateDevice(otherDevice.id, { interfaces: updatedInterfaces });
          }
        }
        
        // 更新されたインターフェースでリンクステータスを再判定してスタイルを更新
        const updatedSourceInterface = conn.source === device.id 
          ? { ...sourceInterface, [field]: value }
          : sourceInterface;
        const updatedTargetInterface = conn.target === device.id
          ? { ...targetInterface, [field]: value }
          : targetInterface;
          
        const linkStatus = determineLinkStatus(updatedSourceInterface, updatedTargetInterface);
        const autoStyle = getConnectionStyleFromLinkStatus(linkStatus, conn.style);
        updateConnection(conn.id, { style: autoStyle });
      }
    });
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

              <Box>
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
                {intf.status !== 'admin-down' && intf.connectedTo && (
                  <Alert severity="info" sx={{ mt: 1 }} icon={<InfoIcon fontSize="small" />}>
                    <Typography variant="caption">
                      Status is automatically determined based on connection compatibility.
                      Set to "Admin Down" to manually control the interface.
                    </Typography>
                  </Alert>
                )}
              </Box>

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