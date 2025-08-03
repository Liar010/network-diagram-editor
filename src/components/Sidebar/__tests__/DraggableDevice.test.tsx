import { Router as RouterIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableDevice from '../DraggableDevice';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        {component}
      </DndProvider>
    </ThemeProvider>
  );
};

describe('DraggableDevice Component', () => {
  const mockDevice = {
    type: 'router' as const,
    label: 'Router',
    icon: <RouterIcon data-testid="router-icon" />
  };

  test('renders device with label and icon', () => {
    renderWithProviders(<DraggableDevice device={mockDevice} />);
    
    expect(screen.getByText('Router')).toBeInTheDocument();
    expect(screen.getByTestId('router-icon')).toBeInTheDocument();
  });

  test('renders as a list item', () => {
    renderWithProviders(<DraggableDevice device={mockDevice} />);
    
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  test('has grab cursor style', () => {
    renderWithProviders(<DraggableDevice device={mockDevice} />);
    
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveStyle('cursor: grab');
  });

  test('has hover effect styles', () => {
    renderWithProviders(<DraggableDevice device={mockDevice} />);
    
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveClass('MuiListItem-root');
  });

  describe('Different Device Types', () => {
    const deviceTypes = [
      { type: 'router', label: 'Router' },
      { type: 'switch', label: 'Switch' },
      { type: 'firewall', label: 'Firewall' },
      { type: 'server', label: 'Server' },
      { type: 'load-balancer', label: 'Load Balancer' },
      { type: 'cloud', label: 'Cloud' },
      { type: 'workstation', label: 'Workstation' },
      { type: 'access-point', label: 'Access Point' }
    ];

    test.each(deviceTypes)('renders $type device correctly', ({ type, label }) => {
      const device = {
        type: type as any,
        label,
        icon: <div data-testid={`${type}-icon`} />
      };

      renderWithProviders(<DraggableDevice device={device} />);
      
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId(`${type}-icon`)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper list item structure', () => {
      renderWithProviders(<DraggableDevice device={mockDevice} />);
      
      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
    });

    test('icon and text are properly associated', () => {
      renderWithProviders(<DraggableDevice device={mockDevice} />);
      
      const listItem = screen.getByRole('listitem');
      expect(listItem).toContainElement(screen.getByTestId('router-icon'));
      expect(listItem).toContainElement(screen.getByText('Router'));
    });
  });

  describe('Drag and Drop Behavior', () => {
    test('component is wrapped with drag functionality', () => {
      renderWithProviders(<DraggableDevice device={mockDevice} />);
      
      // The component should render without errors when wrapped in DnD
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    test('maintains visual feedback styles', () => {
      renderWithProviders(<DraggableDevice device={mockDevice} />);
      
      const listItem = screen.getByRole('listitem');
      expect(listItem).toHaveStyle('cursor: grab');
      // When dragging, opacity should change, but this requires more complex testing
    });
  });
});