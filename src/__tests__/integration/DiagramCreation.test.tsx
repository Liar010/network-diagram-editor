import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../../App';

// Mock React Flow to avoid complex DOM testing
jest.mock('@xyflow/react', () => ({
  ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
  ReactFlow: ({ children, ...props }: any) => (
    <div data-testid="react-flow-canvas" {...props}>
      {children}
      <div data-testid="react-flow-controls">Controls</div>
      <div data-testid="react-flow-minimap">MiniMap</div>
      <div data-testid="react-flow-background">Background</div>
    </div>
  ),
  Controls: () => <div data-testid="controls">Controls</div>,
  MiniMap: () => <div data-testid="minimap">MiniMap</div>,
  Background: () => <div data-testid="background">Background</div>,
  Handle: ({ children, ...props }: any) => <div data-testid="handle" {...props}>{children}</div>,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  },
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn()
}));

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock-image-data')
  });
});

// Mock URL and Blob for export functionality
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn().mockReturnValue('mock-blob-url'),
    revokeObjectURL: jest.fn()
  }
});

Object.defineProperty(global, 'Blob', {
  value: jest.fn().mockImplementation(() => ({ type: 'application/json' }))
});

// Mock document.createElement for file downloads
const mockLink = {
  download: '',
  href: '',
  click: jest.fn()
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockLink;
    }
    return {};
  })
});

describe('Network Diagram Creation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete workflow: app loads, create diagram, configure device, export', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. App should load with all main components
    expect(screen.getByText('Network Diagram Editor')).toBeInTheDocument();
    expect(screen.getByText('Network Devices')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();

    // 2. Should show device library
    expect(screen.getByText('Router')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('Firewall')).toBeInTheDocument();

    // 3. Layer switching should work
    const l1Button = screen.getByRole('button', { name: /l1/i });
    const l2Button = screen.getByRole('button', { name: /l2/i });
    const l3Button = screen.getByRole('button', { name: /l3/i });

    await user.click(l1Button);
    expect(l1Button).toHaveClass('MuiButton-contained');

    await user.click(l2Button);
    expect(l2Button).toHaveClass('MuiButton-contained');

    // 4. Canvas should be present
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();

    // 5. Export functionality should be accessible
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export as PNG')).toBeInTheDocument();
    });
    expect(screen.getByText('Export as SVG')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();

    // Close export menu
    await user.click(document.body);

    // 6. Templates should be accessible
    const templatesButton = screen.getByRole('button', { name: /templates/i });
    await user.click(templatesButton);

    await waitFor(() => {
      expect(screen.getByText('Network Templates')).toBeInTheDocument();
    });
    expect(screen.getByText('Simple LAN')).toBeInTheDocument();
    expect(screen.getByText('DMZ Network')).toBeInTheDocument();
    expect(screen.getByText('Cloud Hybrid')).toBeInTheDocument();
  });

  test('template loading workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open templates
    await user.click(screen.getByRole('button', { name: /templates/i }));

    await waitFor(() => {
      expect(screen.getByText('Network Templates')).toBeInTheDocument();
    });

    // Load Simple LAN template
    const useTemplateButtons = screen.getAllByText('Use Template');
    await user.click(useTemplateButtons[0]);

    // Template dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Network Templates')).not.toBeInTheDocument();
    });

    // The canvas should now have the template loaded (we can't easily test the actual devices
    // without mocking React Flow more extensively, but we can verify the UI responds)
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
  });

  test('clear diagram functionality', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load a template first
    await user.click(screen.getByRole('button', { name: /templates/i }));
    await waitFor(() => {
      expect(screen.getByText('Network Templates')).toBeInTheDocument();
    });

    const useTemplateButtons = screen.getAllByText('Use Template');
    await user.click(useTemplateButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Network Templates')).not.toBeInTheDocument();
    });

    // Now clear the diagram
    const clearButton = screen.getByRole('button', { name: /clear diagram/i });
    await user.click(clearButton);

    // The diagram should be cleared (canvas still present but empty)
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
  });

  test('save and export functionality', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Test save functionality
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should trigger file download
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toBe('network-diagram-save.json');

    // Test export menu
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export as PNG')).toBeInTheDocument();
    });

    // Test PNG export
    await user.click(screen.getByText('Export as PNG'));
    // PNG export should be triggered (html2canvas mock)
    
    // Test SVG export
    await user.click(exportButton);
    await waitFor(() => {
      expect(screen.getByText('Export as SVG')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Export as SVG'));
    // SVG export should be triggered

    // Test JSON export
    await user.click(exportButton);
    await waitFor(() => {
      expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Export as JSON'));
    // JSON export should be triggered
  });

  test('file open functionality', async () => {
    const user = userEvent.setup();
    
    // Mock file input
    const mockFileInput = {
      type: '',
      accept: '',
      onchange: null as any,
      click: jest.fn()
    };
    
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'input') {
        return mockFileInput;
      }
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<App />);

    const openButton = screen.getByRole('button', { name: /open/i });
    await user.click(openButton);

    expect(mockFileInput.type).toBe('file');
    expect(mockFileInput.accept).toBe('.json');
    expect(mockFileInput.click).toHaveBeenCalled();

    // Cleanup
    document.createElement = originalCreateElement;
  });

  test('keyboard accessibility', async () => {
    render(<App />);

    // Check that main interactive elements are focusable
    const buttons = screen.getAllByRole('button');
    
    // Should have multiple buttons (toolbar buttons, layer buttons, etc.)
    expect(buttons.length).toBeGreaterThan(10);

    // Tab navigation should work (basic test)
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Responsive Design', () => {
    test('main layout renders correctly', () => {
      render(<App />);

      // Check main layout structure
      expect(screen.getByText('Network Diagram Editor')).toBeInTheDocument();
      
      // Sidebar should be present
      expect(screen.getByText('Network Devices')).toBeInTheDocument();
      
      // Properties panel should be present
      expect(screen.getByText('Properties')).toBeInTheDocument();
      
      // Canvas should be present
      expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    test('app handles component errors gracefully', () => {
      // This is a basic test - more sophisticated error boundary testing
      // would require intentionally triggering component errors
      render(<App />);
      
      expect(screen.getByText('Network Diagram Editor')).toBeInTheDocument();
    });
  });
});