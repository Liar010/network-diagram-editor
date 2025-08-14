import React, { useState } from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Slider,
  Paper,
  Typography,
  Popover,
  Tooltip,
} from '@mui/material';
import {
  PanTool as SelectIcon,
  Create as PenIcon,
  Highlight as HighlighterIcon,
  CropDin as RectangleIcon,
  CleaningServices as EraserIcon,
  Clear as ClearIcon,
  Palette as ColorIcon,
} from '@mui/icons-material';
import { useDiagramStore } from '../../store/diagramStore';
import { DrawingTool } from '../../types/annotation';

const DrawingToolbar: React.FC = () => {
  const { 
    drawingTool, 
    setDrawingTool, 
    clearDrawings,
    toggleDrawingMode,
  } = useDiagramStore();
  
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);

  const handleToolChange = (
    event: React.MouseEvent<HTMLElement>,
    newTool: DrawingTool | null,
  ) => {
    setDrawingTool(newTool);
    
    // Store current styles in store
    if (newTool) {
      const { setDrawingStyle } = useDiagramStore.getState();
      
      // Update default styles based on tool
      if (newTool === 'highlighter') {
        setStrokeColor('#ffeb3b');
        setStrokeWidth(15);
        setDrawingStyle({ stroke: '#ffeb3b', strokeWidth: 15, strokeOpacity: 0.3 });
      } else if (newTool === 'rectangle') {
        setStrokeColor('#666666');
        setStrokeWidth(2);
        setDrawingStyle({ stroke: '#666666', strokeWidth: 2, strokeOpacity: 1 });
      } else if (newTool === 'pen') {
        setStrokeColor('#000000');
        setStrokeWidth(2);
        setDrawingStyle({ stroke: '#000000', strokeWidth: 2, strokeOpacity: 1 });
      }
    }
  };

  const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setColorAnchor(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorAnchor(null);
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        p: 1,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        zIndex: 1000,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Drawing Tools
      </Typography>
      
      <ToggleButtonGroup
        value={drawingTool}
        exclusive
        onChange={handleToolChange}
        size="small"
      >
        <Tooltip title="Select and delete drawings">
          <ToggleButton value="select" aria-label="select">
            <SelectIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Pen tool">
          <ToggleButton value="pen" aria-label="pen">
            <PenIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Highlighter">
          <ToggleButton value="highlighter" aria-label="highlighter">
            <HighlighterIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Rectangle tool">
          <ToggleButton value="rectangle" aria-label="rectangle">
            <RectangleIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Eraser (not available)">
          <span>
            <ToggleButton value="eraser" aria-label="eraser" disabled>
              <EraserIcon fontSize="small" />
            </ToggleButton>
          </span>
        </Tooltip>
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={handleColorClick}
          disabled={drawingTool === 'select'}
          sx={{
            backgroundColor: drawingTool === 'select' ? '#ccc' : strokeColor,
            border: '2px solid #ccc',
            '&:hover': {
              backgroundColor: drawingTool === 'select' ? '#ccc' : strokeColor,
              opacity: 0.8,
            },
          }}
        >
          <ColorIcon sx={{ color: '#fff', fontSize: 18 }} />
        </IconButton>
        
        <Popover
          open={Boolean(colorAnchor)}
          anchorEl={colorAnchor}
          onClose={handleColorClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {colors.map(color => (
              <IconButton
                key={color}
                size="small"
                onClick={() => {
                  setStrokeColor(color);
                  const { setDrawingStyle } = useDiagramStore.getState();
                  setDrawingStyle({ stroke: color });
                  handleColorClose();
                }}
                sx={{
                  backgroundColor: color,
                  width: 30,
                  height: 30,
                  border: strokeColor === color ? '2px solid #333' : '1px solid #ccc',
                  '&:hover': {
                    backgroundColor: color,
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Box>
        </Popover>

        <Box sx={{ width: 100 }}>
          <Slider
            value={strokeWidth}
            onChange={(e, val) => {
              const width = val as number;
              setStrokeWidth(width);
              const { setDrawingStyle } = useDiagramStore.getState();
              setDrawingStyle({ strokeWidth: width });
            }}
            min={1}
            max={20}
            size="small"
            valueLabelDisplay="auto"
            disabled={drawingTool === 'select'}
          />
        </Box>
      </Box>

      <Tooltip title="Clear all drawings">
        <IconButton 
          size="small" 
          onClick={clearDrawings}
          color="error"
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Close drawing toolbar">
        <IconButton
          size="small"
          onClick={toggleDrawingMode}
          color="default"
          sx={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            lineHeight: 1
          }}
        >
          ×
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default DrawingToolbar;