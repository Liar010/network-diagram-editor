export const snapToGrid = (position: { x: number; y: number }, gridSize: number): { x: number; y: number } => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

export const getGridPatternId = () => 'grid-pattern';

export const createGridPattern = (gridSize: number): string => {
  return `
    <defs>
      <pattern id="${getGridPatternId()}" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
        <circle cx="${gridSize / 2}" cy="${gridSize / 2}" r="1" fill="#ddd" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${getGridPatternId()})" />
  `;
};