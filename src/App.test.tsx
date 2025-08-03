import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Component', () => {
  test('renders network diagram editor title', () => {
    render(<App />);
    const titleElement = screen.getByText(/network diagram editor/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders main application sections', () => {
    render(<App />);
    
    // Check for main UI sections
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar/Toolbar
    expect(screen.getByText(/network devices/i)).toBeInTheDocument(); // Sidebar
  });

  test('renders layer switching buttons', () => {
    render(<App />);
    
    expect(screen.getByRole('button', { name: /l1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /l2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /l3/i })).toBeInTheDocument();
  });
});
