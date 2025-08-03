import {
  AccountTree as HierarchicalIcon,
  ScatterPlot as ForceIcon,
  RadioButtonUnchecked as CircularIcon,
  GridOn as GridIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Slider,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import React, { useState } from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { LayoutOptions } from '../../utils/layoutUtils';

interface AutoLayoutDialogProps {
  open: boolean;
  onClose: () => void;
}

const algorithmOptions = [
  {
    value: 'hierarchical' as const,
    label: 'Hierarchical',
    description: 'Organizes devices by network layers (routers → switches → endpoints)',
    icon: <HierarchicalIcon />
  },
  {
    value: 'force' as const,
    label: 'Force-Directed',
    description: 'Uses physics simulation to minimize edge crossings',
    icon: <ForceIcon />
  },
  {
    value: 'circular' as const,
    label: 'Circular',
    description: 'Arranges devices in a circular pattern',
    icon: <CircularIcon />
  },
  {
    value: 'grid' as const,
    label: 'Grid',
    description: 'Organizes devices in a regular grid pattern',
    icon: <GridIcon />
  }
];

const AutoLayoutDialog: React.FC<AutoLayoutDialogProps> = ({ open, onClose }) => {
  const { autoLayout, devices } = useDiagramStore();
  const [algorithm, setAlgorithm] = useState<LayoutOptions['algorithm']>('hierarchical');
  const [spacing, setSpacing] = useState(150);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('vertical');

  const handleApply = () => {
    const options: LayoutOptions = {
      algorithm,
      spacing,
      direction,
      centerX: 400, // Default canvas center
      centerY: 300
    };

    autoLayout(options);
    onClose();
  };

  const canApplyLayout = devices.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Auto Layout</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Automatically arrange your network devices using different layout algorithms.
            {!canApplyLayout && (
              <Typography component="span" color="warning.main">
                {' '}Add some devices to your diagram first.
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Algorithm Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Layout Algorithm
          </Typography>
          <Grid container spacing={2}>
            {algorithmOptions.map((option) => (
              <Grid key={option.value} size={{ xs: 12, sm: 6 }}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: algorithm === option.value ? 2 : 1,
                    borderColor: algorithm === option.value ? 'primary.main' : 'divider',
                    backgroundColor: algorithm === option.value ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => setAlgorithm(option.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {option.icon}
                    <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Spacing Control */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Device Spacing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Distance between devices: {spacing}px
          </Typography>
          <Slider
            value={spacing}
            onChange={(_, value) => setSpacing(value as number)}
            min={100}
            max={300}
            step={25}
            marks={[
              { value: 100, label: '100px' },
              { value: 200, label: '200px' },
              { value: 300, label: '300px' }
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Direction Control (only for hierarchical layout) */}
        {algorithm === 'hierarchical' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Layout Direction
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'horizontal' | 'vertical')}
                row
              >
                <FormControlLabel
                  value="vertical"
                  control={<Radio />}
                  label="Vertical (top to bottom)"
                />
                <FormControlLabel
                  value="horizontal"
                  control={<Radio />}
                  label="Horizontal (left to right)"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Preview/Info Section */}
        <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Layout Preview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Algorithm: {algorithmOptions.find(opt => opt.value === algorithm)?.label}
            • Devices to arrange: {devices.length}
            • Spacing: {spacing}px
            {algorithm === 'hierarchical' && (
              <>
                <br />• Direction: {direction}
              </>
            )}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          disabled={!canApplyLayout}
        >
          Apply Layout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoLayoutDialog;