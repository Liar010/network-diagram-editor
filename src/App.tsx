import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Canvas from './components/Canvas/Canvas';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Properties from './components/Properties/Properties';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  useKeyboardShortcuts();
  
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <ErrorBoundary>
              <Toolbar />
            </ErrorBoundary>
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <ErrorBoundary>
                <Sidebar />
              </ErrorBoundary>
              <Box sx={{ flex: 1, position: 'relative' }}>
                <ErrorBoundary>
                  <Canvas />
                </ErrorBoundary>
              </Box>
              <ErrorBoundary>
                <Properties />
              </ErrorBoundary>
            </Box>
          </Box>
        </DndProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
