import {
  Save as SaveIcon,
  FileOpen as OpenIcon,
  Download as ExportIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  GridOn as GridOnIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Code as JSONIcon,
  Dashboard as TemplatesIcon,
  AutoFixHigh as AutoLayoutIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar as MuiToolbar,
  Typography,
  Button,
  ButtonGroup,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import React, { useState } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { exportToPNG, exportToSVG, exportToJSON, exportToCSV } from '../../utils/exportUtils';
import AutoLayoutDialog from '../AutoLayout/AutoLayoutDialog';
import ExportPreviewDialog from '../ExportPreview/ExportPreviewDialog';
import Templates from '../Templates/Templates';
import ZoomControls from './ZoomControls';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const Toolbar: React.FC = () => {
  const { layer, setLayer, clearDiagram, devices, connections, undo, redo, canUndo, canRedo, gridEnabled, toggleGrid } = useDiagramStore();
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [autoLayoutOpen, setAutoLayoutOpen] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportToPNG('react-flow-canvas');
      showNotification('PNG export completed successfully!', 'success');
    } catch (error) {
      console.error('Export to PNG failed:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to export PNG. Please try again.',
        'error'
      );
    } finally {
      setIsExporting(false);
      handleExportClose();
    }
  };

  const handleExportSVG = () => {
    setIsExporting(true);
    try {
      exportToSVG(devices, connections);
      showNotification('SVG export completed successfully!', 'success');
    } catch (error) {
      console.error('Export to SVG failed:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to export SVG. Please try again.',
        'error'
      );
    } finally {
      setIsExporting(false);
      handleExportClose();
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      exportToJSON(devices, connections);
      showNotification('JSON export completed successfully!', 'success');
    } catch (error) {
      console.error('Export to JSON failed:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to export JSON. Please try again.',
        'error'
      );
    } finally {
      setIsExporting(false);
      handleExportClose();
    }
  };

  const handleExportCSV = () => {
    handleExportClose();
    setExportPreviewOpen(true);
  };

  const handleSave = () => {
    try {
      exportToJSON(devices, connections, 'network-diagram-save.json');
      showNotification('Diagram saved successfully!', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to save diagram. Please try again.',
        'error'
      );
    }
  };

  const handleOpen = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification('File too large. Please select a file smaller than 10MB.', 'error');
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const jsonString = e.target?.result as string;
              if (!jsonString) {
                throw new Error('File is empty or unreadable');
              }

              const data = JSON.parse(jsonString);
              
              // Validate data structure
              if (!data.devices || !Array.isArray(data.devices)) {
                throw new Error('Invalid file format: missing or invalid devices array');
              }
              if (!data.connections || !Array.isArray(data.connections)) {
                throw new Error('Invalid file format: missing or invalid connections array');
              }

              // Load the diagram data
              const { loadDiagram } = useDiagramStore.getState();
              const diagram = {
                id: `imported-${Math.random().toString(36).substr(2, 9)}`,
                name: data.name || 'Imported Diagram',
                devices: data.devices || [],
                connections: data.connections || [],
                groups: data.groups || [],
                layer: data.layer || 'L3' as const,
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                updatedAt: new Date()
              };
              loadDiagram(diagram);
              showNotification(`Successfully loaded ${data.devices.length} devices and ${data.connections.length} connections`, 'success');
            } catch (error) {
              console.error('Failed to load file:', error);
              showNotification(
                error instanceof Error ? `Failed to load file: ${error.message}` : 'Failed to load file. Please check the file format.',
                'error'
              );
            }
          };
          reader.onerror = () => {
            showNotification('Failed to read file. Please try again.', 'error');
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Failed to open file dialog:', error);
      showNotification('Failed to open file dialog. Please try again.', 'error');
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar>
        <Typography variant="h6" sx={{ mr: 3 }}>
          Network Diagram Editor
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <ButtonGroup size="small">
            <Tooltip title="Templates">
              <Button onClick={() => setTemplatesOpen(true)}>
                <TemplatesIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Open">
              <Button onClick={handleOpen}>
                <OpenIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Save">
              <Button onClick={handleSave}>
                <SaveIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Export">
              <Button onClick={handleExportClick} disabled={isExporting}>
                {isExporting ? <CircularProgress size={20} /> : <ExportIcon />}
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ButtonGroup size="small">
            <Tooltip title="Undo">
              <Button onClick={undo} disabled={!canUndo()}>
                <UndoIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Redo">
              <Button onClick={redo} disabled={!canRedo()}>
                <RedoIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ZoomControls />
          <Tooltip title={gridEnabled ? "Disable Grid" : "Enable Grid"}>
            <Button size="small" onClick={toggleGrid} variant={gridEnabled ? "contained" : "outlined"}>
              <GridOnIcon />
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Tooltip title="Auto Layout">
            <Button onClick={() => setAutoLayoutOpen(true)}>
              <AutoLayoutIcon />
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ButtonGroup size="small" variant="contained">
            <Button
              onClick={() => setLayer('L1')}
              variant={layer === 'L1' ? 'contained' : 'outlined'}
            >
              L1
            </Button>
            <Button
              onClick={() => setLayer('L2')}
              variant={layer === 'L2' ? 'contained' : 'outlined'}
            >
              L2
            </Button>
            <Button
              onClick={() => setLayer('L3')}
              variant={layer === 'L3' ? 'contained' : 'outlined'}
            >
              L3
            </Button>
          </ButtonGroup>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Clear Diagram">
            <IconButton color="error" onClick={clearDiagram}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </MuiToolbar>
      
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={handleExportPNG}>
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText>Export as PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportSVG}>
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText>Export as SVG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <JSONIcon />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <JSONIcon />
          </ListItemIcon>
          <ListItemText>Export as CSV (Preview)</ListItemText>
        </MenuItem>
      </Menu>
      
      <Templates
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
      />

      <AutoLayoutDialog
        open={autoLayoutOpen}
        onClose={() => setAutoLayoutOpen(false)}
      />
      
      <ExportPreviewDialog
        open={exportPreviewOpen}
        onClose={() => setExportPreviewOpen(false)}
        devices={devices}
        connections={connections}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Toolbar;