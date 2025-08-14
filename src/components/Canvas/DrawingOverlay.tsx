import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Box } from '@mui/material';
import { useDiagramStore } from '../../store/diagramStore';

const DrawingOverlay: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { 
    drawings, 
    currentDrawing, 
    isDrawingMode,
    drawingTool,
    startDrawing,
    addDrawingPoint,
    finishDrawing 
  } = useDiagramStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangleStart, setRectangleStart] = useState<{ x: number; y: number } | null>(null);

  // マウス座標をReact Flow座標系に変換
  const getFlowPosition = useCallback((event: React.MouseEvent) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    
    return screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }, [screenToFlowPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode || !drawingTool) return;
    
    const point = getFlowPosition(e);
    if (!point) return;
    
    setIsDrawing(true);
    
    if (drawingTool === 'rectangle') {
      setRectangleStart(point);
    }
    
    startDrawing(drawingTool, point);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isDrawingMode) return;
    
    const point = getFlowPosition(e);
    if (!point) return;
    
    addDrawingPoint(point);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      finishDrawing();
      setIsDrawing(false);
      setRectangleStart(null);
    }
  };

  // マウスがSVG外に出た時も描画を終了
  const handleMouseLeave = () => {
    if (isDrawing) {
      finishDrawing();
      setIsDrawing(false);
      setRectangleStart(null);
    }
  };

  // パスをSVG path要素に変換
  const pathToSvgPath = (drawing: typeof currentDrawing | typeof drawings[0]): string => {
    if (!drawing || drawing.points.length < 2) return '';
    
    if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
      // 矩形の場合は最初と最後の点から矩形を作成
      const start = drawing.points[0];
      const end = drawing.points[drawing.points.length - 1];
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return `M ${x} ${y} h ${width} v ${height} h -${width} Z`;
    }
    
    // フリーハンドパス
    return drawing.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  };

  // 描画モードでない時は何も表示しない
  if (!isDrawingMode && drawings.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isDrawingMode ? 'auto' : 'none',
        zIndex: isDrawingMode ? 100 : 1,
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDrawingMode ? (
            drawingTool === 'eraser' ? 'crosshair' :
            drawingTool === 'rectangle' ? 'crosshair' :
            drawingTool === 'highlighter' ? 'crosshair' :
            'crosshair'
          ) : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* 既存の描画 */}
        {drawings.map(drawing => {
          if (drawing.type === 'highlighter') {
            // ハイライター効果
            return (
              <g key={drawing.id}>
                <path
                  d={pathToSvgPath(drawing)}
                  stroke={drawing.style.stroke}
                  strokeWidth={drawing.style.strokeWidth * 3}
                  strokeOpacity={0.3}
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            );
          }
          
          if (drawing.type === 'rectangle') {
            // 矩形
            return (
              <path
                key={drawing.id}
                d={pathToSvgPath(drawing)}
                stroke={drawing.style.stroke}
                strokeWidth={drawing.style.strokeWidth}
                strokeOpacity={drawing.style.strokeOpacity}
                strokeDasharray={drawing.style.strokeDasharray}
                fill={drawing.style.fill || 'none'}
                fillOpacity={drawing.style.fill ? 0.1 : 0}
              />
            );
          }
          
          return (
            <path
              key={drawing.id}
              d={pathToSvgPath(drawing)}
              stroke={drawing.style.stroke}
              strokeWidth={drawing.style.strokeWidth}
              strokeOpacity={drawing.style.strokeOpacity}
              strokeLinecap="round"
              strokeDasharray={drawing.style.strokeDasharray}
              fill="none"
            />
          );
        })}
        
        {/* 現在描画中のパス */}
        {currentDrawing && (
          <path
            d={pathToSvgPath(currentDrawing)}
            stroke={currentDrawing.style.stroke}
            strokeWidth={currentDrawing.style.strokeWidth}
            strokeOpacity={currentDrawing.style.strokeOpacity}
            strokeLinecap="round"
            strokeDasharray={currentDrawing.style.strokeDasharray}
            fill={currentDrawing.type === 'rectangle' ? (currentDrawing.style.fill || 'none') : 'none'}
            fillOpacity={currentDrawing.type === 'rectangle' && currentDrawing.style.fill ? 0.1 : 0}
          />
        )}
      </svg>
    </Box>
  );
};

export default DrawingOverlay;