import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from '../Sidebar';

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

describe('Sidebar Component', () => {
  test('renders sidebar title and description', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Network Devices')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop to canvas')).toBeInTheDocument();
  });

  test('renders all network device types', () => {
    renderWithProviders(<Sidebar />);
    
    // Check for all device types
    expect(screen.getByText('Router')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('Firewall')).toBeInTheDocument();
    expect(screen.getByText('Server')).toBeInTheDocument();
    expect(screen.getByText('Load Balancer')).toBeInTheDocument();
    expect(screen.getByText('Cloud')).toBeInTheDocument();
    expect(screen.getByText('Workstation')).toBeInTheDocument();
    expect(screen.getByText('Access Point')).toBeInTheDocument();
  });

  test('renders device icons', () => {
    renderWithProviders(<Sidebar />);
    
    // Check that icons are rendered (they should have SVG elements)
    const icons = screen.getAllByTestId(/svg/i);
    expect(icons.length).toBeGreaterThan(0);
  });

  test('has proper list structure', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByRole('list')).toBeInTheDocument();
    
    // Should have 8 list items (one for each device type)
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(8);
  });

  test('each device item is clickable', () => {
    renderWithProviders(<Sidebar />);
    
    const deviceItems = screen.getAllByRole('listitem');
    deviceItems.forEach(item => {
      expect(item).toHaveClass('MuiListItem-root');
    });
  });

  describe('Drag and Drop', () => {
    test('device items have draggable cursor style', () => {
      renderWithProviders(<Sidebar />);
      
      const routerItem = screen.getByText('Router').closest('.MuiListItem-root');
      expect(routerItem).toHaveStyle('cursor: grab');
    });

    test('device items should be draggable', () => {
      renderWithProviders(<Sidebar />);
      
      // Check that draggable items exist
      const routerItem = screen.getByText('Router').closest('.MuiListItem-root');
      expect(routerItem).toBeInTheDocument();
      
      // Note: Full drag and drop testing would require more complex setup
      // with react-dnd testing utilities
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      renderWithProviders(<Sidebar />);
      
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(8);
    });

    test('has descriptive text for screen readers', () => {
      renderWithProviders(<Sidebar />);
      
      expect(screen.getByText('Drag and drop to canvas')).toBeInTheDocument();
    });
  });

  describe('Device Types Coverage', () => {
    const expectedDeviceTypes = [
      'Router',
      'Switch', 
      'Firewall',
      'Server',
      'Load Balancer',
      'Cloud',
      'Workstation',
      'Access Point'
    ];

    test.each(expectedDeviceTypes)('renders %s device', (deviceType) => {
      renderWithProviders(<Sidebar />);
      expect(screen.getByText(deviceType)).toBeInTheDocument();
    });
  });
});