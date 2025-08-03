import { useEffect } from 'react';
import { useDiagramStore } from '../store/diagramStore';

export const useKeyboardShortcuts = () => {
  const { 
    undo, 
    redo, 
    copySelected, 
    paste, 
    deleteSelected, 
    clearSelection,
    selectedDevices,
    selectedConnections,
    selectedDevice,
    selectedConnection
  } = useDiagramStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
          case 'c':
            event.preventDefault();
            copySelected();
            break;
          case 'v':
            event.preventDefault();
            paste();
            break;
          case 'a':
            event.preventDefault();
            // Select all devices - we can add this functionality later
            break;
        }
      } else {
        // Single key shortcuts
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            event.preventDefault();
            const hasSelection = 
              selectedDevices.length > 0 || 
              selectedConnections.length > 0 || 
              selectedDevice || 
              selectedConnection;
            
            if (hasSelection) {
              deleteSelected();
            }
            break;
          case 'Escape':
            event.preventDefault();
            clearSelection();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, 
    redo, 
    copySelected, 
    paste, 
    deleteSelected, 
    clearSelection,
    selectedDevices,
    selectedConnections,
    selectedDevice,
    selectedConnection
  ]);
};