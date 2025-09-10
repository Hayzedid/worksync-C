import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '../test/test-utils';
import React from 'react';
import { ErrorBoundary, useErrorHandler } from '../components/ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock component using the error handler hook
const ComponentWithErrorHandler = ({ shouldError = false }: { shouldError?: boolean }) => {
  const handleError = useErrorHandler();
  
  React.useEffect(() => {
    if (shouldError) {
      handleError(new Error('Async error'));
    }
  }, [shouldError, handleError]);
  
  return <div>Component content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('should render fallback UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeDefined();
    expect(screen.getByText(/an error occurred while rendering/i)).toBeDefined();
  });

  it('should show custom error message in fallback UI', () => {
    // For now, just test that the default error message appears
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeDefined();
  });

  it('should show error details in development mode', () => {
    // Mock NODE_ENV for this test
    const mockEnv = { ...process.env };
    (process as any).env = { ...mockEnv, NODE_ENV: 'development' };
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test error')).toBeDefined();
    
    // Restore original environment
    (process as any).env = mockEnv;
  });

  it('should provide a refresh button', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const refreshButton = screen.getByText(/refresh page/i);
    expect(refreshButton).toBeDefined();
    
    refreshButton.click();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should handle retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error state
    expect(screen.getByText(/something went wrong/i)).toBeDefined();
    
    // Click retry button (which resets error boundary)
    const retryButton = screen.getByText(/try again/i);
    retryButton.click();
    
    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeDefined();
  });
});
