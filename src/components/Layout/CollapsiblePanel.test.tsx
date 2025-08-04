import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollapsiblePanel from './CollapsiblePanel';

describe('CollapsiblePanel', () => {
  const mockOnToggle = jest.fn();
  const defaultProps = {
    children: <div>Test Content</div>,
    side: 'left' as const,
    collapsed: false,
    onToggle: mockOnToggle,
    title: 'Test Panel',
  };

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders children when not collapsed', () => {
    render(<CollapsiblePanel {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('hides children when collapsed', () => {
    render(<CollapsiblePanel {...defaultProps} collapsed={true} />);
    const content = screen.getByText('Test Content');
    expect(content.parentElement).toHaveStyle({ opacity: '0', visibility: 'hidden' });
  });

  it('calls onToggle when toggle button is clicked', () => {
    render(<CollapsiblePanel {...defaultProps} />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('shows correct icon based on side and collapsed state', () => {
    const { rerender } = render(<CollapsiblePanel {...defaultProps} />);
    expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();

    rerender(<CollapsiblePanel {...defaultProps} collapsed={true} />);
    expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();

    rerender(<CollapsiblePanel {...defaultProps} side="right" collapsed={false} />);
    expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();

    rerender(<CollapsiblePanel {...defaultProps} side="right" collapsed={true} />);
    expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
  });

  it('applies correct width based on collapsed state', () => {
    const { rerender, container } = render(<CollapsiblePanel {...defaultProps} width={300} collapsedWidth={50} />);
    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle({ width: '300px' });

    rerender(<CollapsiblePanel {...defaultProps} width={300} collapsedWidth={50} collapsed={true} />);
    expect(panel).toHaveStyle({ width: '50px' });
  });

  it('shows correct tooltip based on collapsed state', () => {
    const { rerender } = render(<CollapsiblePanel {...defaultProps} />);
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse Test Panel');

    rerender(<CollapsiblePanel {...defaultProps} collapsed={true} />);
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand Test Panel');
  });
});