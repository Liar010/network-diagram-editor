import React, { useRef, useState, useCallback } from 'react';
import { Panel, useReactFlow, useStore } from '@xyflow/react';
import { useDiagramStore } from '../../store/diagramStore';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const SelectableDrawingPanel: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const reactFlowInstance = useReactFlow();
  const transform = useStore((state) => state.transform);
  const { 
    drawings, 
    currentDrawing, 
    isDrawingMode,
    drawingTool,
    selectedDrawing,
    startDrawing,
    addDrawingPoint,
    finishDrawing,
    selectDrawing,
    deleteDrawing,
  } = useDiagramStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredDrawing, setHoveredDrawing] = useState<string | null>(null);

  // マウス座標をReact Flow座標系に変換
  const getFlowPosition = useCallback((event: React.MouseEvent) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    
    // transform を考慮した座標変換
    const [translateX, translateY, scale] = transform;
    const flowX = (x - translateX) / scale;
    const flowY = (y - translateY) / scale;
    
    return { x: flowX, y: flowY };
  }, [transform]);

  // 点が描画パス上にあるかチェック
  const isPointOnPath = useCallback((point: { x: number; y: number }, drawing: typeof drawings[0]) => {
    if (drawing.points.length < 2) return false;
    
    const threshold = 10 / transform[2]; // スケールに応じて閾値を調整
    
    // 矩形の場合
    if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
      const start = drawing.points[0];
      const end = drawing.points[drawing.points.length - 1];
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      
      // 矩形の境界線上にあるかチェック
      const onLeft = Math.abs(point.x - minX) < threshold && point.y >= minY && point.y <= maxY;
      const onRight = Math.abs(point.x - maxX) < threshold && point.y >= minY && point.y <= maxY;
      const onTop = Math.abs(point.y - minY) < threshold && point.x >= minX && point.x <= maxX;
      const onBottom = Math.abs(point.y - maxY) < threshold && point.x >= minX && point.x <= maxX;
      
      return onLeft || onRight || onTop || onBottom;
    }
    
    // フリーハンドパスの場合
    for (let i = 0; i < drawing.points.length - 1; i++) {
      const p1 = drawing.points[i];
      const p2 = drawing.points[i + 1];
      
      // 線分と点の距離を計算
      const lineLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      if (lineLength === 0) continue;
      
      const t = Math.max(0, Math.min(1, ((point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y)) / (lineLength ** 2)));
      const projection = {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      };
      
      const distance = Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2);
      
      if (distance < threshold) {
        return true;
      }
    }
    
    return false;
  }, [transform]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getFlowPosition(e);
    if (!point) return;
    
    if (isDrawingMode && drawingTool && drawingTool !== 'select') {
      // 描画モード（選択ツール以外）
      setIsDrawing(true);
      startDrawing(drawingTool, point);
    } else if (!isDrawingMode || drawingTool === 'select') {
      // 選択モード（描画モードでない、または選択ツール）
      let foundDrawing = null;
      for (let i = drawings.length - 1; i >= 0; i--) {
        if (isPointOnPath(point, drawings[i])) {
          foundDrawing = drawings[i];
          break;
        }
      }
      
      if (foundDrawing) {
        selectDrawing(foundDrawing);
      } else {
        selectDrawing(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getFlowPosition(e);
    if (!point) return;
    
    if (isDrawing && isDrawingMode) {
      addDrawingPoint(point);
    } else if (!isDrawingMode) {
      // ホバー検出
      let foundDrawing = null;
      for (let i = drawings.length - 1; i >= 0; i--) {
        if (isPointOnPath(point, drawings[i])) {
          foundDrawing = drawings[i];
          break;
        }
      }
      setHoveredDrawing(foundDrawing?.id || null);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      finishDrawing();
      setIsDrawing(false);
    }
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      finishDrawing();
      setIsDrawing(false);
    }
    setHoveredDrawing(null);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDrawing) {
      deleteDrawing(selectedDrawing.id);
    }
  };

  // パスをSVG path要素に変換（transformを適用）
  const pathToSvgPath = (drawing: typeof currentDrawing | typeof drawings[0]): string => {
    if (!drawing || drawing.points.length < 2) return '';
    
    const [translateX, translateY, scale] = transform;
    
    if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
      const start = drawing.points[0];
      const end = drawing.points[drawing.points.length - 1];
      const x = Math.min(start.x, end.x) * scale + translateX;
      const y = Math.min(start.y, end.y) * scale + translateY;
      const width = Math.abs(end.x - start.x) * scale;
      const height = Math.abs(end.y - start.y) * scale;
      return `M ${x} ${y} h ${width} v ${height} h -${width} Z`;
    }
    
    return drawing.points
      .map((p, i) => {
        const x = p.x * scale + translateX;
        const y = p.y * scale + translateY;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  if (!isDrawingMode && drawings.length === 0) return null;

  return (
    <>
      <Panel position="top-left" style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: (isDrawingMode || drawings.length > 0) ? 'auto' : 'none',
        zIndex: isDrawingMode ? 100 : 1,
      }}>
        <svg
          ref={svgRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: isDrawingMode ? 'crosshair' : hoveredDrawing ? 'pointer' : 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* 既存の描画 */}
          {drawings.map(drawing => {
            const isSelected = selectedDrawing?.id === drawing.id;
            const isHovered = hoveredDrawing === drawing.id;
            const strokeWidthMultiplier = isSelected ? 1.5 : isHovered ? 1.2 : 1;
            
            if (drawing.type === 'highlighter') {
              return (
                <g key={drawing.id}>
                  <path
                    d={pathToSvgPath(drawing)}
                    stroke={drawing.style.stroke}
                    strokeWidth={drawing.style.strokeWidth * transform[2] * strokeWidthMultiplier}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {isSelected && (
                    <path
                      d={pathToSvgPath(drawing)}
                      stroke="#2196f3"
                      strokeWidth={(drawing.style.strokeWidth + 4) * transform[2]}
                      strokeOpacity={0.2}
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>
              );
            }
            
            if (drawing.type === 'rectangle') {
              return (
                <g key={drawing.id}>
                  <path
                    d={pathToSvgPath(drawing)}
                    stroke={drawing.style.stroke}
                    strokeWidth={drawing.style.strokeWidth * transform[2] * strokeWidthMultiplier}
                    strokeOpacity={drawing.style.strokeOpacity}
                    strokeDasharray={drawing.style.strokeDasharray}
                    fill={drawing.style.fill || 'none'}
                    fillOpacity={drawing.style.fill ? 0.1 : 0}
                  />
                  {isSelected && (
                    <path
                      d={pathToSvgPath(drawing)}
                      stroke="#2196f3"
                      strokeWidth={(drawing.style.strokeWidth + 4) * transform[2]}
                      strokeOpacity={0.3}
                      strokeDasharray="5 5"
                      fill="none"
                    />
                  )}
                </g>
              );
            }
            
            return (
              <g key={drawing.id}>
                <path
                  d={pathToSvgPath(drawing)}
                  stroke={drawing.style.stroke}
                  strokeWidth={drawing.style.strokeWidth * transform[2] * strokeWidthMultiplier}
                  strokeOpacity={drawing.style.strokeOpacity}
                  strokeLinecap="round"
                  strokeDasharray={drawing.style.strokeDasharray}
                  fill="none"
                />
                {isSelected && (
                  <path
                    d={pathToSvgPath(drawing)}
                    stroke="#2196f3"
                    strokeWidth={(drawing.style.strokeWidth + 4) * transform[2]}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </g>
            );
          })}
          
          {/* 現在描画中のパス */}
          {currentDrawing && (
            <path
              d={pathToSvgPath(currentDrawing)}
              stroke={currentDrawing.style.stroke}
              strokeWidth={currentDrawing.style.strokeWidth * transform[2]}
              strokeOpacity={currentDrawing.style.strokeOpacity}
              strokeLinecap="round"
              strokeDasharray={currentDrawing.style.strokeDasharray}
              fill={currentDrawing.type === 'rectangle' ? (currentDrawing.style.fill || 'none') : 'none'}
              fillOpacity={currentDrawing.type === 'rectangle' && currentDrawing.style.fill ? 0.1 : 0}
            />
          )}
        </svg>
      </Panel>
      
      {/* 削除ボタン - 選択中の描画があり、かつ描画モードでない場合、または選択ツールの場合に表示 */}
      {selectedDrawing && (!isDrawingMode || drawingTool === 'select') && (
        <Panel
          position="top-left"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
          }}
        >
          <Paper elevation={3} sx={{ p: 1 }}>
            <Tooltip title="Delete selected drawing">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        </Panel>
      )}
    </>
  );
};

export default SelectableDrawingPanel;