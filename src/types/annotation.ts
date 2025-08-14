export type AnnotationType = 'text-note' | 'sticky';

export interface AnnotationStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  fontSize?: number;
  fontColor?: string;
  opacity?: number;
  zIndex?: number;
}

export interface StructuredAnnotation {
  id: string;
  type: AnnotationType;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
  style?: AnnotationStyle;
}

export type DrawingTool = 'select' | 'pen' | 'highlighter' | 'arrow' | 'eraser' | 'rectangle';

export interface DrawingStyle {
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeLinecap?: 'round' | 'square' | 'butt';
  strokeDasharray?: string;
  fill?: string;
}

export interface FreehandDrawing {
  id: string;
  type: 'pen' | 'highlighter' | 'arrow' | 'rectangle';
  points: Array<{ x: number; y: number }>;
  style: DrawingStyle;
  smoothing?: number;
}