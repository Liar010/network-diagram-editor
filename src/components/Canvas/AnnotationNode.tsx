import React, { useState, useRef, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { 
  Paper, 
  TextField, 
  Typography, 
  Box,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useDiagramStore } from '../../store/diagramStore';
import { StructuredAnnotation } from '../../types/annotation';

const AnnotationNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  dragging,
}) => {
  const { annotation } = data as { annotation: StructuredAnnotation };
  const { updateAnnotation, deleteAnnotation, selectAnnotation } = useDiagramStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(annotation.content || '');
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textFieldRef.current) {
      textFieldRef.current.focus();
      textFieldRef.current.setSelectionRange(0, textFieldRef.current.value.length);
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTempContent(annotation.content || '');
  };

  const handleSave = () => {
    updateAnnotation(annotation.id, { content: tempContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(annotation.content || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAnnotation(annotation);
  };

  // テキストノート
  if (annotation.type === 'text-note') {
    return (
      <Paper
        elevation={selected ? 4 : 1}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        sx={{
          p: 2,
          minWidth: annotation.size?.width || 200,
          minHeight: annotation.size?.height || 50,
          backgroundColor: annotation.style?.backgroundColor || '#fffbf0',
          borderColor: annotation.style?.borderColor,
          borderStyle: annotation.style?.borderStyle,
          borderWidth: annotation.style?.borderWidth,
          opacity: annotation.style?.opacity || 1,
          cursor: dragging ? 'grabbing' : 'grab',
          position: 'relative',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        {isEditing ? (
          <TextField
            inputRef={textFieldRef}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            multiline
            fullWidth
            variant="standard"
            placeholder="Enter your note..."
            sx={{
              '& .MuiInputBase-input': {
                fontSize: annotation.style?.fontSize || 14,
                color: annotation.style?.fontColor || '#333',
              },
            }}
          />
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{
                fontSize: annotation.style?.fontSize || 14,
                color: annotation.style?.fontColor || '#333',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {annotation.content || 'Double-click to edit'}
            </Typography>
            {selected && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -35,
                  right: 0,
                  display: 'flex',
                  gap: 0.5,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{ p: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </>
        )}
      </Paper>
    );
  }

  // 付箋ノート
  if (annotation.type === 'sticky') {
    return (
      <Paper
        elevation={selected ? 4 : 2}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        sx={{
          p: 2,
          minWidth: annotation.size?.width || 200,
          minHeight: annotation.size?.height || 150,
          backgroundColor: annotation.style?.backgroundColor || '#ffeb3b',
          position: 'relative',
          cursor: dragging ? 'grabbing' : 'grab',
          '&:hover': {
            boxShadow: 4,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -5,
            right: -5,
            width: 20,
            height: 20,
            backgroundColor: 'inherit',
            transform: 'rotate(45deg)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          },
        }}
      >
        {isEditing ? (
          <TextField
            inputRef={textFieldRef}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            multiline
            fullWidth
            variant="standard"
            placeholder="Enter your note..."
            sx={{
              '& .MuiInputBase-input': {
                fontSize: annotation.style?.fontSize || 14,
                color: annotation.style?.fontColor || '#333',
              },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: annotation.style?.fontSize || 14,
              color: annotation.style?.fontColor || '#333',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {annotation.content || 'Double-click to edit'}
          </Typography>
        )}
      </Paper>
    );
  }


  return null;
};

export default AnnotationNode;