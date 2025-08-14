import { 
  Close as CloseIcon, 
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
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
  Chip,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { determineLinkStatus, getConnectionStyleFromLinkStatus, determineInterfaceStatus } from '../../utils/linkStatusUtils';
import { migrateDeviceToInterfaces } from '../../utils/migrationUtils';
import DeviceConfigImport from './DeviceConfigImport';
import InterfacesSection from './InterfacesSection';

const Properties: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | false>('basic');
  const [configImportOpen, setConfigImportOpen] = useState(false);
  const { 
    selectedDevice, 
    selectedConnection,
    selectedAnnotation, 
    updateDevice, 
    updateConnection,
    updateAnnotation,
    selectDevice, 
    selectConnection,
    selectAnnotation,
    deleteDevice,
    deleteConnection,
    deleteAnnotation,
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

  if (!currentDevice && !selectedConnection && !selectedAnnotation) {
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

  // Annotation properties
  if (selectedAnnotation) {
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
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Annotation Properties</Typography>
            <IconButton
              size="small"
              onClick={() => {
                deleteAnnotation(selectedAnnotation.id);
                selectAnnotation(null);
              }}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            value={selectedAnnotation.content || ''}
            onChange={(e) => updateAnnotation(selectedAnnotation.id, { content: e.target.value })}
            margin="normal"
            size="small"
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Style</Typography>
          
          <TextField
            fullWidth
            label="Background Color"
            value={selectedAnnotation.style?.backgroundColor || '#ffffff'}
            onChange={(e) => updateAnnotation(selectedAnnotation.id, {
              style: { ...selectedAnnotation.style, backgroundColor: e.target.value }
            })}
            margin="normal"
            size="small"
            type="color"
          />
          
          
          <TextField
            fullWidth
            label="Font Size"
            type="number"
            value={selectedAnnotation.style?.fontSize || 14}
            onChange={(e) => updateAnnotation(selectedAnnotation.id, {
              style: { ...selectedAnnotation.style, fontSize: parseInt(e.target.value) || 14 }
            })}
            margin="normal"
            size="small"
            inputProps={{ min: 10, max: 32 }}
          />
          
          <TextField
            fullWidth
            label="Text Color"
            value={selectedAnnotation.style?.fontColor || '#333333'}
            onChange={(e) => updateAnnotation(selectedAnnotation.id, {
              style: { ...selectedAnnotation.style, fontColor: e.target.value }
            })}
            margin="normal"
            size="small"
            type="color"
          />
          
          <TextField
            fullWidth
            label="Opacity"
            type="number"
            value={selectedAnnotation.style?.opacity || 1}
            onChange={(e) => updateAnnotation(selectedAnnotation.id, {
              style: { ...selectedAnnotation.style, opacity: parseFloat(e.target.value) || 1 }
            })}
            margin="normal"
            size="small"
            inputProps={{ min: 0, max: 1, step: 0.1 }}
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Size</Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Width"
              type="number"
              value={selectedAnnotation.size?.width || 200}
              onChange={(e) => updateAnnotation(selectedAnnotation.id, {
                size: { 
                  width: parseInt(e.target.value) || 200,
                  height: selectedAnnotation.size?.height || 100
                }
              })}
              size="small"
              inputProps={{ min: 50, max: 800 }}
            />
            
            <TextField
              label="Height"
              type="number"
              value={selectedAnnotation.size?.height || 100}
              onChange={(e) => updateAnnotation(selectedAnnotation.id, {
                size: { 
                  width: selectedAnnotation.size?.width || 200,
                  height: parseInt(e.target.value) || 100
                }
              })}
              size="small"
              inputProps={{ min: 50, max: 600 }}
            />
          </Box>
        </Box>
      </Paper>
    );
  }

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
            <Box>
              <Tooltip title="Import/Export Configuration">
                <IconButton size="small" onClick={() => setConfigImportOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => selectDevice(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
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
                const newInterfaceId = e.target.value;
                const oldInterfaceId = selectedConnection.sourceInterfaceId;
                
                // 最新のデバイス情報を取得
                const currentSourceDevice = devices.find(d => d.id === selectedConnection.source);
                const currentTargetDevice = devices.find(d => d.id === selectedConnection.target);
                
                // インターフェースが未選択になった場合、古いインターフェースのステータスをDownに戻す
                if (!newInterfaceId && oldInterfaceId && currentSourceDevice) {
                  const oldInterface = currentSourceDevice.interfaces?.find(i => i.id === oldInterfaceId);
                  if (oldInterface && oldInterface.status !== 'admin-down') {
                    const updatedSourceInterfaces = currentSourceDevice.interfaces.map(intf =>
                      intf.id === oldInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentSourceDevice.id, { interfaces: updatedSourceInterfaces });
                  }
                }
                // 別のインターフェースが選択された場合も、古いインターフェースのステータスをDownに戻す
                else if (oldInterfaceId && oldInterfaceId !== newInterfaceId && currentSourceDevice) {
                  const oldInterface = currentSourceDevice.interfaces?.find(i => i.id === oldInterfaceId);
                  if (oldInterface && oldInterface.status !== 'admin-down') {
                    const updatedSourceInterfaces = currentSourceDevice.interfaces.map(intf =>
                      intf.id === oldInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentSourceDevice.id, { interfaces: updatedSourceInterfaces });
                  }
                }
                
                const sourceInterface = newInterfaceId ? currentSourceDevice?.interfaces?.find(i => i.id === newInterfaceId) : null;
                const targetInterfaceId = selectedConnection.targetInterfaceId || 
                  (selectedConnection.targetPort && currentTargetDevice?.interfaces?.find(i => i.name === selectedConnection.targetPort)?.id);
                const targetInterface = targetInterfaceId ? currentTargetDevice?.interfaces?.find(i => i.id === targetInterfaceId) : null;
                
                // 両方のインターフェースが選択されているかチェック
                const bothSelected = !!(newInterfaceId && targetInterfaceId);
                
                // 接続タイプを自動設定
                let connectionType = selectedConnection.type;
                if (sourceInterface && targetInterface && sourceInterface.type === targetInterface.type) {
                  connectionType = sourceInterface.type;
                }
                
                // ステータスとスタイルを更新
                if (bothSelected && sourceInterface && targetInterface) {
                  // インターフェースステータスを自動更新
                  const sourceStatus = determineInterfaceStatus(sourceInterface, targetInterface, true);
                  const targetStatus = determineInterfaceStatus(targetInterface, sourceInterface, true);
                  
                  // ソースデバイスのインターフェースを更新
                  if (currentSourceDevice && sourceInterface.status !== 'admin-down') {
                    const updatedSourceInterfaces = currentSourceDevice.interfaces.map(intf =>
                      intf.id === newInterfaceId ? { ...intf, status: sourceStatus } : intf
                    );
                    updateDevice(currentSourceDevice.id, { interfaces: updatedSourceInterfaces });
                  }
                  
                  // ターゲットデバイスのインターフェースを更新
                  if (currentTargetDevice && targetInterface.status !== 'admin-down') {
                    const updatedTargetInterfaces = currentTargetDevice.interfaces.map(intf =>
                      intf.id === targetInterface.id ? { ...intf, status: targetStatus } : intf
                    );
                    updateDevice(currentTargetDevice.id, { interfaces: updatedTargetInterfaces });
                  }
                  
                  // リンクステータスを判定してスタイルを自動更新
                  const linkStatus = determineLinkStatus(
                    { ...sourceInterface, status: sourceStatus },
                    { ...targetInterface, status: targetStatus }
                  );
                  const autoStyle = getConnectionStyleFromLinkStatus(linkStatus, selectedConnection.style);
                  
                  updateConnection(selectedConnection.id, { 
                    sourceInterfaceId: newInterfaceId,
                    sourcePort: sourceInterface?.name || '',
                    type: connectionType,
                    style: autoStyle
                  });
                } else {
                  // 片方または両方が未選択の場合
                  // ターゲットのステータスもDownに戻す
                  if (targetInterface && targetInterface.status !== 'admin-down' && currentTargetDevice) {
                    const updatedTargetInterfaces = currentTargetDevice.interfaces.map(intf =>
                      intf.id === targetInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentTargetDevice.id, { interfaces: updatedTargetInterfaces });
                  }
                  
                  // リンクダウンスタイルを適用
                  const linkStatus = { isUp: false, reason: 'Interface not selected' };
                  const autoStyle = getConnectionStyleFromLinkStatus(linkStatus, selectedConnection.style);
                  
                  updateConnection(selectedConnection.id, { 
                    sourceInterfaceId: newInterfaceId,
                    sourcePort: sourceInterface?.name || '',
                    type: connectionType,
                    style: autoStyle
                  });
                }
              }}
              label="Source Interface"
            >
              <MenuItem value="">
                <Typography variant="caption" color="text.secondary">(None)</Typography>
              </MenuItem>
              {(() => {
                const sourceDevice = devices.find(d => d.id === selectedConnection.source);
                return sourceDevice ? (
                  sourceDevice.interfaces?.map((iface) => (
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
                );
              })()}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Target Interface</InputLabel>
            <Select
              value={selectedConnection.targetInterfaceId || 
                     (selectedConnection.targetPort && connectionDevices?.target?.interfaces?.find(i => i.name === selectedConnection.targetPort)?.id) || 
                     ''}
              onChange={(e) => {
                const newInterfaceId = e.target.value;
                const oldInterfaceId = selectedConnection.targetInterfaceId;
                
                // 最新のデバイス情報を取得
                const currentSourceDevice = devices.find(d => d.id === selectedConnection.source);
                const currentTargetDevice = devices.find(d => d.id === selectedConnection.target);
                
                // インターフェースが未選択になった場合、古いインターフェースのステータスをDownに戻す
                if (!newInterfaceId && oldInterfaceId && currentTargetDevice) {
                  const oldInterface = currentTargetDevice.interfaces?.find(i => i.id === oldInterfaceId);
                  if (oldInterface && oldInterface.status !== 'admin-down') {
                    const updatedTargetInterfaces = currentTargetDevice.interfaces.map(intf =>
                      intf.id === oldInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentTargetDevice.id, { interfaces: updatedTargetInterfaces });
                  }
                }
                // 別のインターフェースが選択された場合も、古いインターフェースのステータスをDownに戻す
                else if (oldInterfaceId && oldInterfaceId !== newInterfaceId && currentTargetDevice) {
                  const oldInterface = currentTargetDevice.interfaces?.find(i => i.id === oldInterfaceId);
                  if (oldInterface && oldInterface.status !== 'admin-down') {
                    const updatedTargetInterfaces = currentTargetDevice.interfaces.map(intf =>
                      intf.id === oldInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentTargetDevice.id, { interfaces: updatedTargetInterfaces });
                  }
                }
                
                const targetInterface = newInterfaceId ? currentTargetDevice?.interfaces?.find(i => i.id === newInterfaceId) : null;
                const sourceInterfaceId = selectedConnection.sourceInterfaceId || 
                  (selectedConnection.sourcePort && currentSourceDevice?.interfaces?.find(i => i.name === selectedConnection.sourcePort)?.id);
                const sourceInterface = sourceInterfaceId ? currentSourceDevice?.interfaces?.find(i => i.id === sourceInterfaceId) : null;
                
                // 両方のインターフェースが選択されているかチェック
                const bothSelected = !!(newInterfaceId && sourceInterfaceId);
                
                // 接続タイプを自動設定
                let connectionType = selectedConnection.type;
                if (sourceInterface && targetInterface && sourceInterface.type === targetInterface.type) {
                  connectionType = targetInterface.type;
                }
                
                // ステータスとスタイルを更新
                if (bothSelected && sourceInterface && targetInterface) {
                  // インターフェースステータスを自動更新（Admin Downでない限り）
                  const sourceStatus = determineInterfaceStatus(sourceInterface, targetInterface, true);
                  const targetStatus = determineInterfaceStatus(targetInterface, sourceInterface, true);
                  
                  // ソースデバイスのインターフェースを更新
                  if (currentSourceDevice && sourceInterface.status !== 'admin-down') {
                    const updatedSourceInterfaces = currentSourceDevice.interfaces.map(intf =>
                      intf.id === sourceInterface.id ? { ...intf, status: sourceStatus } : intf
                    );
                    updateDevice(currentSourceDevice.id, { interfaces: updatedSourceInterfaces });
                  }
                  
                  // ターゲットデバイスのインターフェースを更新
                  if (currentTargetDevice && targetInterface.status !== 'admin-down') {
                    const updatedTargetInterfaces = currentTargetDevice.interfaces.map(intf =>
                      intf.id === newInterfaceId ? { ...intf, status: targetStatus } : intf
                    );
                    updateDevice(currentTargetDevice.id, { interfaces: updatedTargetInterfaces });
                  }
                  
                  // リンクステータスを判定してスタイルを自動更新
                  const linkStatus = determineLinkStatus(
                    { ...sourceInterface, status: sourceStatus },
                    { ...targetInterface, status: targetStatus }
                  );
                  const autoStyle = getConnectionStyleFromLinkStatus(linkStatus, selectedConnection.style);
                  
                  updateConnection(selectedConnection.id, { 
                    targetInterfaceId: newInterfaceId,
                    targetPort: targetInterface?.name || '',
                    type: connectionType,
                    style: autoStyle
                  });
                } else {
                  // 片方または両方が未選択の場合
                  // ソースのステータスもDownに戻す
                  if (sourceInterface && sourceInterface.status !== 'admin-down' && currentSourceDevice) {
                    const updatedSourceInterfaces = currentSourceDevice.interfaces.map(intf =>
                      intf.id === sourceInterfaceId ? { ...intf, status: 'down' as const } : intf
                    );
                    updateDevice(currentSourceDevice.id, { interfaces: updatedSourceInterfaces });
                  }
                  
                  // リンクダウンスタイルを適用
                  const linkStatus = { isUp: false, reason: 'Interface not selected' };
                  const autoStyle = getConnectionStyleFromLinkStatus(linkStatus, selectedConnection.style);
                  
                  updateConnection(selectedConnection.id, { 
                    targetInterfaceId: newInterfaceId,
                    targetPort: targetInterface?.name || '',
                    type: connectionType,
                    style: autoStyle
                  });
                }
              }}
              label="Target Interface"
            >
              <MenuItem value="">
                <Typography variant="caption" color="text.secondary">(None)</Typography>
              </MenuItem>
              {(() => {
                const targetDevice = devices.find(d => d.id === selectedConnection.target);
                return targetDevice ? (
                  targetDevice.interfaces?.map((iface) => (
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
                );
              })()}
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
          
          {/* リンクステータス表示 */}
          {(() => {
            const sourceInterfaceId = selectedConnection.sourceInterfaceId || 
              (selectedConnection.sourcePort && connectionDevices?.source?.interfaces?.find(i => i.name === selectedConnection.sourcePort)?.id);
            const targetInterfaceId = selectedConnection.targetInterfaceId || 
              (selectedConnection.targetPort && connectionDevices?.target?.interfaces?.find(i => i.name === selectedConnection.targetPort)?.id);
            
            if (sourceInterfaceId && targetInterfaceId) {
              const sourceInterface = connectionDevices?.source?.interfaces?.find(i => i.id === sourceInterfaceId);
              const targetInterface = connectionDevices?.target?.interfaces?.find(i => i.id === targetInterfaceId);
              const linkStatus = determineLinkStatus(sourceInterface, targetInterface);
              
              return (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Link Status
                  </Typography>
                  <Chip
                    label={linkStatus.isUp ? 'Link Up' : 'Link Down'}
                    color={linkStatus.isUp ? 'success' : 'error'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {!linkStatus.isUp && linkStatus.reason && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Reason: {linkStatus.reason}
                    </Typography>
                  )}
                </Box>
              );
            }
            return null;
          })()}
          
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
      
      {/* Configuration Import Dialog */}
      <DeviceConfigImport
        open={configImportOpen}
        onClose={() => setConfigImportOpen(false)}
      />
    </Paper>
  );
};

export default Properties;