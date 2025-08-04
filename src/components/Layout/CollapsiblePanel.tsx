import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  collapsed: boolean;
  onToggle: () => void;
  width?: number;
  collapsedWidth?: number;
  title?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  side,
  collapsed,
  onToggle,
  width = 250,
  collapsedWidth = 48,
  title = 'Toggle Panel'
}) => {
  return (
    <Box
      sx={{
        width: collapsed ? collapsedWidth : width,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: side === 'left' ? 1 : 0,
        borderLeft: side === 'right' ? 1 : 0,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Tooltip title={collapsed ? `Expand ${title}` : `Collapse ${title}`} placement={side === 'left' ? 'right' : 'left'}>
        <IconButton
          size="small"
          onClick={onToggle}
          aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          sx={{
            position: 'absolute',
            top: 8,
            [side === 'left' ? 'right' : 'left']: 4,
            zIndex: 1,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {side === 'left' 
            ? (collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />)
            : (collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />)
          }
        </IconButton>
      </Tooltip>
      
      <Box
        sx={{
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 0.2s ease',
          visibility: collapsed ? 'hidden' : 'visible',
          flex: 1,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default CollapsiblePanel;