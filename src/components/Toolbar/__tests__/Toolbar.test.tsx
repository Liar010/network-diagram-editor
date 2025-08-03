import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useDiagramStore } from '../../../store/diagramStore';
import Toolbar from '../Toolbar';

// Mock the store
jest.mock('../../../store/diagramStore', () => ({
  useDiagramStore: jest.fn()
}));
const mockUseDiagramStore = useDiagramStore as jest.MockedFunction<typeof useDiagramStore>;

// Mock export utilities
jest.mock('../../../utils/exportUtils', () => ({
  exportToPNG: jest.fn().mockResolvedValue(undefined),
  exportToSVG: jest.fn(),
  exportToJSON: jest.fn(),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Toolbar Component', () => {
  const mockStore = {
    layer: 'L3' as const,
    setLayer: jest.fn(),
    clearDiagram: jest.fn(),
    devices: [],
    connections: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDiagramStore.mockReturnValue(mockStore);
  });

  test('renders toolbar with title', () => {
    renderWithTheme(<Toolbar />);
    
    expect(screen.getByText('Network Diagram Editor')).toBeInTheDocument();
  });

  test('renders all main action buttons', () => {
    renderWithTheme(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  test('renders layer switching buttons', () => {
    renderWithTheme(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /l1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /l2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /l3/i })).toBeInTheDocument();
  });

  test('renders control buttons', () => {
    renderWithTheme(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fit to screen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle grid/i })).toBeInTheDocument();
  });

  test('renders clear diagram button', () => {
    renderWithTheme(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /clear diagram/i })).toBeInTheDocument();
  });

  describe('Layer Switching', () => {
    test('calls setLayer when layer buttons are clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /l1/i }));
      expect(mockStore.setLayer).toHaveBeenCalledWith('L1');

      await user.click(screen.getByRole('button', { name: /l2/i }));
      expect(mockStore.setLayer).toHaveBeenCalledWith('L2');

      await user.click(screen.getByRole('button', { name: /l3/i }));
      expect(mockStore.setLayer).toHaveBeenCalledWith('L3');
    });

    test('highlights current layer button', () => {
      mockUseDiagramStore.mockReturnValue({
        ...mockStore,
        layer: 'L2'
      });

      renderWithTheme(<Toolbar />);
      
      const l2Button = screen.getByRole('button', { name: /l2/i });
      expect(l2Button).toHaveClass('MuiButton-contained');
    });
  });

  describe('Clear Diagram', () => {
    test('calls clearDiagram when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /clear diagram/i }));
      expect(mockStore.clearDiagram).toHaveBeenCalled();
    });
  });

  describe('Export Menu', () => {
    test('opens export menu when export button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /export/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Export as PNG')).toBeInTheDocument();
      });
      expect(screen.getByText('Export as SVG')).toBeInTheDocument();
      expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    });

    test('closes export menu when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Toolbar />);
      
      // Open menu
      await user.click(screen.getByRole('button', { name: /export/i }));
      await waitFor(() => {
        expect(screen.getByText('Export as PNG')).toBeInTheDocument();
      });

      // Click outside (on document body)
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Export as PNG')).not.toBeInTheDocument();
      });
    });
  });

  describe('Templates Dialog', () => {
    test('opens templates dialog when templates button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /templates/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Network Templates')).toBeInTheDocument();
      });
    });
  });

  describe('File Operations', () => {
    test('triggers save operation when save button is clicked', async () => {
      const user = userEvent.setup();
      const { exportToJSON } = require('../../../utils/exportUtils');
      
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /save/i }));
      
      expect(exportToJSON).toHaveBeenCalledWith([], [], 'network-diagram-save.json');
    });

    test('triggers file input when open button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock createElement and click
      const mockInput = {
        type: '',
        accept: '',
        onchange: null as any,
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockInput as any);
      
      renderWithTheme(<Toolbar />);
      
      await user.click(screen.getByRole('button', { name: /open/i }));
      
      expect(mockInput.type).toBe('file');
      expect(mockInput.accept).toBe('.json');
      expect(mockInput.click).toHaveBeenCalled();
      
      jest.restoreAllMocks();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for icon buttons', () => {
      renderWithTheme(<Toolbar />);
      
      expect(screen.getByRole('button', { name: /templates/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /clear diagram/i })).toHaveAttribute('aria-label');
    });

    test('has proper roles for interactive elements', () => {
      renderWithTheme(<Toolbar />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
      expect(screen.getAllByRole('button')).toHaveLength(15); // All buttons
    });
  });
});