import { useCallback } from 'react';

export const useZoomControls = () => {
  const zoomIn = useCallback(() => {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowElement) return;

    const event = new WheelEvent('wheel', {
      deltaY: -100,
      clientX: reactFlowElement.offsetWidth / 2,
      clientY: reactFlowElement.offsetHeight / 2,
      bubbles: true,
      cancelable: true,
    });

    const viewport = reactFlowElement.querySelector('.react-flow__viewport');
    if (viewport) {
      viewport.dispatchEvent(event);
    }
  }, []);

  const zoomOut = useCallback(() => {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowElement) return;

    const event = new WheelEvent('wheel', {
      deltaY: 100,
      clientX: reactFlowElement.offsetWidth / 2,
      clientY: reactFlowElement.offsetHeight / 2,
      bubbles: true,
      cancelable: true,
    });

    const viewport = reactFlowElement.querySelector('.react-flow__viewport');
    if (viewport) {
      viewport.dispatchEvent(event);
    }
  }, []);

  const fitView = useCallback(() => {
    // Find all nodes
    const nodes = document.querySelectorAll('.react-flow__node');
    if (nodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach((node) => {
      const transform = node.getAttribute('transform');
      if (transform) {
        const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const rect = node.getBoundingClientRect();
          
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + rect.width);
          maxY = Math.max(maxY, y + rect.height);
        }
      }
    });

    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (reactFlowElement) {
      const { offsetWidth, offsetHeight } = reactFlowElement;
      const padding = 50;
      
      const scaleX = (offsetWidth - padding * 2) / (maxX - minX);
      const scaleY = (offsetHeight - padding * 2) / (maxY - minY);
      const scale = Math.min(scaleX, scaleY, 1);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const translateX = offsetWidth / 2 - centerX * scale;
      const translateY = offsetHeight / 2 - centerY * scale;

      const viewport = reactFlowElement.querySelector('.react-flow__viewport') as HTMLElement;
      if (viewport) {
        viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }
    }
  }, []);

  return { zoomIn, zoomOut, fitView };
};