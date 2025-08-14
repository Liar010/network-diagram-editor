import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper,
} from '@mui/material';
import { AnnotationType } from '../../types/annotation';

interface DraggableAnnotationProps {
  type: AnnotationType;
  label: string;
  icon: React.ReactElement;
}

const DraggableAnnotation: React.FC<DraggableAnnotationProps> = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'annotation',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as any}>
      <Paper
        elevation={isDragging ? 4 : 1}
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          mb: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            elevation: 3,
            transform: 'translateX(4px)',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {icon}
          </ListItemIcon>
          <ListItemText 
            primary={label} 
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: 500,
            }}
          />
        </ListItem>
      </Paper>
    </div>
  );
};

export default DraggableAnnotation;