import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import React, { useState, useRef } from 'react';
import { templates } from '../../data/deviceConfigTemplates';
import { useDiagramStore } from '../../store/diagramStore';
import { DeviceConfigTemplate, DeviceConfigImportOptions } from '../../types/deviceConfig';
import {
  parseDeviceConfigJSON,
  importDeviceConfig,
  exportDeviceConfig,
  stringifyDeviceConfig,
} from '../../utils/deviceConfigUtils';

interface DeviceConfigImportProps {
  open: boolean;
  onClose: () => void;
}

const DeviceConfigImport: React.FC<DeviceConfigImportProps> = ({ open, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { devices, selectedDevice, selectedDevices, updateDevice } = useDiagramStore();
  
  const [importMode, setImportMode] = useState<'all' | 'selected' | 'type'>('all');
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [mergeInterfaces, setMergeInterfaces] = useState(false);
  const [configTemplate, setConfigTemplate] = useState<DeviceConfigTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const template = parseDeviceConfigJSON(content);
        setConfigTemplate(template);
        setJsonInput(content);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse configuration file');
        setConfigTemplate(null);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      try {
        const template = parseDeviceConfigJSON(value);
        setConfigTemplate(template);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON format');
        setConfigTemplate(null);
      }
    } else {
      setConfigTemplate(null);
      setError(null);
    }
  };

  const handleImport = () => {
    if (!configTemplate) return;

    const options: DeviceConfigImportOptions = {
      mode: importMode,
      overwriteExisting,
      mergeInterfaces,
    };

    // 適用対象のデバイスを決定
    let targetDevices = devices;
    if (importMode === 'selected') {
      if (selectedDevices.length > 0) {
        targetDevices = selectedDevices;
      } else if (selectedDevice) {
        targetDevices = [selectedDevice];
      } else {
        setError('No devices selected for import');
        return;
      }
    }

    // 設定をインポート
    const updatedDevices = importDeviceConfig(targetDevices, configTemplate, options);
    
    // ストアを更新
    updatedDevices.forEach(device => {
      updateDevice(device.id, device);
    });

    // 状態をリセット
    setShowTemplatePreview(false);
    setShowJsonInput(false);
    setJsonInput('');
    setConfigTemplate(null);
    setError(null);
    
    onClose();
  };

  const handleExport = () => {
    const template = exportDeviceConfig(devices);
    const jsonString = stringifyDeviceConfig(template);
    
    // ダウンロード
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'device-config-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleTemplate = () => {
    // sample-device-config.jsonをダウンロード
    const link = document.createElement('a');
    link.href = '/sample-device-config.json';
    link.download = 'sample-device-config.json';
    link.click();
  };

  const handleLoadSampleTemplate = async () => {
    try {
      const response = await fetch('/sample-device-config.json');
      const template = await response.json();
      setConfigTemplate(template);
      setJsonInput(JSON.stringify(template, null, 2));
      setError(null);
      setShowTemplatePreview(true);
    } catch (err) {
      setError('Failed to load sample template');
    }
  };

  const getSampleTemplate = (): string => {
    return stringifyDeviceConfig({
      version: '1.0',
      deviceConfigs: {
        router: {
          config: {
            hostname: 'CORE-RTR-01',
            managementIp: '10.0.0.1'
          },
          interfaces: [
            {
              name: 'gi0/0',
              type: 'ethernet',
              speed: '1000',
              status: 'up',
              mode: 'routed',
              ipAddress: '192.168.1.1',
              subnet: '255.255.255.0'
            }
          ]
        },
        switch: {
          config: {
            hostname: 'SW-CORE-01',
            managementIp: '10.0.1.1'
          },
          interfaces: [
            {
              name: 'gi1/0/1',
              type: 'ethernet',
              speed: '1000',
              status: 'up',
              mode: 'trunk',
              vlans: [10, 20, 30]
            }
          ]
        }
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Device Configuration Import/Export
        <Tooltip title="Import device configurations and interface settings from a JSON template">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export / Template
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              fullWidth
            >
              Export Current Device Configurations
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CategoryIcon />}
                onClick={handleDownloadSampleTemplate}
                fullWidth
              >
                Download Sample Template
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={handleLoadSampleTemplate}
                fullWidth
              >
                Preview Sample Template
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Import Configuration
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ mb: 1 }}
          >
            Upload Configuration File
          </Button>
          
          <Button
            variant="text"
            onClick={() => setShowJsonInput(!showJsonInput)}
            fullWidth
          >
            {showJsonInput ? 'Hide' : 'Show'} JSON Input
          </Button>
        </Box>

        {(showJsonInput || showTemplatePreview) && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <TextField
              multiline
              rows={10}
              fullWidth
              placeholder="Paste JSON configuration here..."
              value={jsonInput}
              onChange={(e) => handleJsonInputChange(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
              label={showTemplatePreview ? "Sample Template Preview" : undefined}
            />
            {showTemplatePreview && (
              <Alert severity="info" sx={{ mt: 1 }}>
                This is the sample template. You can modify it above or click "Import Configuration" to apply it.
              </Alert>
            )}
            {!showTemplatePreview && (
              <Button
                size="small"
                onClick={() => handleJsonInputChange(getSampleTemplate())}
                sx={{ mt: 1 }}
              >
                Load Sample Template
              </Button>
            )}
          </Paper>
        )}

        {configTemplate && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Configuration loaded successfully. Found settings for:{' '}
            {Object.keys(configTemplate.deviceConfigs).join(', ')}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import Mode
          </Typography>
          <RadioGroup
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'all' | 'selected' | 'type')}
          >
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="Apply to all devices"
            />
            <FormControlLabel
              value="selected"
              control={<Radio />}
              label={`Apply to selected devices ${
                selectedDevices.length > 0 
                  ? `(${selectedDevices.length} devices)`
                  : selectedDevice 
                    ? '(1 device)'
                    : '(none selected)'
              }`}
              disabled={!selectedDevice && selectedDevices.length === 0}
            />
            <FormControlLabel
              value="type"
              control={<Radio />}
              label="Apply to devices by type (matching template types)"
            />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
            }
            label="Overwrite existing configurations"
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
            When disabled, only empty fields will be filled
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mergeInterfaces}
                onChange={(e) => setMergeInterfaces(e.target.checked)}
              />
            }
            label="Merge interfaces"
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
            When enabled, new interfaces are added to existing ones. When disabled, interfaces are replaced.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!configTemplate}
        >
          Import Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceConfigImport;