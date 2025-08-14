import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const MIN_WIDTH = 100;
const MIN_HEIGHT = 50;

const ResizableAnnotationNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  dragging,
}) => {
  const { annotation } = data as { annotation: StructuredAnnotation };
  const { updateAnnotation, deleteAnnotation, selectAnnotation, selectedAnnotation } = useDiagramStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(annotation.content || '');
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({
    width: annotation.size?.width || 200,
    height: annotation.size?.height || 100,
  });
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  // Check if this annotation is selected
  const isSelected = selectedAnnotation?.id === annotation.id || selected;

  useEffect(() => {
    if (isEditing && textFieldRef.current) {
      textFieldRef.current.focus();
      textFieldRef.current.select();
    }
  }, [isEditing]);

  // Update local size when annotation changes
  useEffect(() => {
    setSize({
      width: annotation.size?.width || 200,
      height: annotation.size?.height || 100,
    });
  }, [annotation.size]);

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

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      let newWidth = resizeStartPos.current.width;
      let newHeight = resizeStartPos.current.height;

      if (corner.includes('right')) {
        newWidth = Math.max(MIN_WIDTH, resizeStartPos.current.width + deltaX);
      }
      if (corner.includes('left')) {
        newWidth = Math.max(MIN_WIDTH, resizeStartPos.current.width - deltaX);
      }
      if (corner.includes('bottom')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStartPos.current.height + deltaY);
      }
      if (corner.includes('top')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStartPos.current.height - deltaY);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Get the final size from the current state
      setSize((currentSize) => {
        // Save the final size to store
        updateAnnotation(annotation.id, {
          size: { width: currentSize.width, height: currentSize.height }
        });
        return currentSize;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, annotation.id, updateAnnotation]);

  // Resize handle component  
  const ResizeHandle: React.FC<{ corner: string }> = ({ corner }) => {
    // Prevent event propagation to stop node dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      handleResizeStart(e, corner);
    };

    const positionStyles: React.CSSProperties = {};
    
    // Position corner handles
    if (corner === 'top-left') {
      positionStyles.top = -4;
      positionStyles.left = -4;
    } else if (corner === 'top-right') {
      positionStyles.top = -4;
      positionStyles.right = -4;
    } else if (corner === 'bottom-left') {
      positionStyles.bottom = -4;
      positionStyles.left = -4;
    } else if (corner === 'bottom-right') {
      positionStyles.bottom = -4;
      positionStyles.right = -4;
    }
    // Position edge handles in the middle
    else if (corner === 'top') {
      positionStyles.top = -4;
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
    } else if (corner === 'bottom') {
      positionStyles.bottom = -4;
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
    } else if (corner === 'left') {
      positionStyles.left = -4;
      positionStyles.top = '50%';
      positionStyles.transform = 'translateY(-50%)';
    } else if (corner === 'right') {
      positionStyles.right = -4;
      positionStyles.top = '50%';
      positionStyles.transform = 'translateY(-50%)';
    }
    
    let cursor = 'nwse-resize';
    if (corner === 'top' || corner === 'bottom') cursor = 'ns-resize';
    if (corner === 'left' || corner === 'right') cursor = 'ew-resize';
    if (corner === 'top-right' || corner === 'bottom-left') cursor = 'nesw-resize';

    return (
      <Box
        onMouseDown={handleMouseDown}
        className="nodrag nopan"
        sx={{
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: isSelected ? '#1976d2' : 'transparent',
          border: isSelected ? '1px solid #1976d2' : 'none',
          cursor,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.2s',
          borderRadius: '2px',
          pointerEvents: 'auto',
          zIndex: 1000,
          '&:hover': {
            backgroundColor: '#1976d2',
            opacity: 1,
          },
          ...positionStyles,
        }}
      />
    );
  };

  const baseStyles = {
    width: size.width,
    height: size.height,
    position: 'relative' as const,
    cursor: isResizing ? 'default' : (dragging ? 'grabbing' : 'grab'),
  };

  // Text note
  if (annotation.type === 'text-note') {
    return (
      <Box sx={baseStyles}>
        <Paper
          ref={nodeRef}
          elevation={isSelected ? 4 : 1}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          sx={{
            p: 2,
            width: '100%',
            height: '100%',
            backgroundColor: annotation.style?.backgroundColor || '#fffbf0',
            borderColor: annotation.style?.borderColor,
            borderStyle: annotation.style?.borderStyle,
            borderWidth: annotation.style?.borderWidth,
            opacity: annotation.style?.opacity || 1,
            overflow: 'auto',
            '&:hover': {
              boxShadow: 3,
            },
          }}
        >
          {isEditing ? (
            <TextField
              ref={textFieldRef}
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
              {isSelected && (
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
        
        {/* Resize handles */}
        {isSelected && !isEditing && (
          <div className="nodrag nopan">
            <ResizeHandle corner="top-left" />
            <ResizeHandle corner="top-right" />
            <ResizeHandle corner="bottom-left" />
            <ResizeHandle corner="bottom-right" />
            <ResizeHandle corner="top" />
            <ResizeHandle corner="bottom" />
            <ResizeHandle corner="left" />
            <ResizeHandle corner="right" />
          </div>
        )}
      </Box>
    );
  }

  // Sticky note
  if (annotation.type === 'sticky') {
    return (
      <Box sx={baseStyles}>
        <Paper
          elevation={isSelected ? 4 : 2}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          sx={{
            p: 2,
            width: '100%',
            height: '100%',
            backgroundColor: annotation.style?.backgroundColor || '#ffeb3b',
            position: 'relative',
            overflow: 'auto',
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
              ref={textFieldRef}
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
        
        {/* Resize handles */}
        {isSelected && !isEditing && (
          <div className="nodrag nopan">
            <ResizeHandle corner="top-left" />
            <ResizeHandle corner="top-right" />
            <ResizeHandle corner="bottom-left" />
            <ResizeHandle corner="bottom-right" />
            <ResizeHandle corner="top" />
            <ResizeHandle corner="bottom" />
            <ResizeHandle corner="left" />
            <ResizeHandle corner="right" />
          </div>
        )}
      </Box>
    );
  }

  // Rectangle area
  if (annotation.type === 'rectangle') {
    return (
      <Box
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        sx={{
          ...baseStyles,
          border: `${annotation.style?.borderWidth || 2}px ${
            annotation.style?.borderStyle || 'dashed'
          } ${annotation.style?.borderColor || '#666'}`,
          backgroundColor: annotation.style?.backgroundColor || 'rgba(255,255,255,0.1)',
          borderRadius: 1,
          opacity: annotation.style?.opacity || 0.5,
          '&:hover': {
            opacity: 0.7,
          },
        }}
      >
        {annotation.content && (
          <Box sx={{ p: 1 }}>
            {isEditing ? (
              <TextField
                ref={textFieldRef}
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                fullWidth
                variant="standard"
                placeholder="Label..."
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: annotation.style?.fontSize || 12,
                    color: annotation.style?.fontColor || '#666',
                  },
                }}
              />
            ) : (
              <Typography
                variant="caption"
                sx={{
                  fontSize: annotation.style?.fontSize || 12,
                  color: annotation.style?.fontColor || '#666',
                }}
              >
                {annotation.content}
              </Typography>
            )}
          </Box>
        )}
        
        {/* Resize handles */}
        {isSelected && !isEditing && (
          <div className="nodrag nopan">
            <ResizeHandle corner="top-left" />
            <ResizeHandle corner="top-right" />
            <ResizeHandle corner="bottom-left" />
            <ResizeHandle corner="bottom-right" />
            <ResizeHandle corner="top" />
            <ResizeHandle corner="bottom" />
            <ResizeHandle corner="left" />
            <ResizeHandle corner="right" />
          </div>
        )}
      </Box>
    );
  }

  // Large area
  if (annotation.type === 'area') {
    return (
      <Box
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        sx={{
          ...baseStyles,
          backgroundColor: annotation.style?.backgroundColor || 'rgba(100,100,100,0.05)',
          border: `2px dashed ${annotation.style?.borderColor || '#999'}`,
          borderRadius: 2,
          padding: 2,
          opacity: annotation.style?.opacity || 0.8,
          '&:hover': {
            backgroundColor: 'rgba(100,100,100,0.08)',
          },
        }}
      >
        {isEditing ? (
          <TextField
            ref={textFieldRef}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            fullWidth
            variant="standard"
            placeholder="Area label..."
            sx={{
              '& .MuiInputBase-input': {
                fontSize: annotation.style?.fontSize || 16,
                color: annotation.style?.fontColor || '#666',
                fontWeight: 500,
              },
            }}
          />
        ) : (
          annotation.content && (
            <Typography
              variant="h6"
              sx={{
                fontSize: annotation.style?.fontSize || 16,
                color: annotation.style?.fontColor || '#666',
                fontWeight: 500,
              }}
            >
              {annotation.content}
            </Typography>
          )
        )}
        
        {/* Resize handles */}
        {isSelected && !isEditing && (
          <div className="nodrag nopan">
            <ResizeHandle corner="top-left" />
            <ResizeHandle corner="top-right" />
            <ResizeHandle corner="bottom-left" />
            <ResizeHandle corner="bottom-right" />
            <ResizeHandle corner="top" />
            <ResizeHandle corner="bottom" />
            <ResizeHandle corner="left" />
            <ResizeHandle corner="right" />
          </div>
        )}
      </Box>
    );
  }

  return null;
};

export default ResizableAnnotationNode;