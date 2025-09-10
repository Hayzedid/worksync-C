import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '../test/test-utils';
import { LoadingSpinner, LoadingState, LoadingButton } from '../components/LoadingStates';

describe('LoadingStates Components', () => {
  describe('LoadingSpinner', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeDefined();
    });

    it('should render with custom size', () => {
      render(<LoadingSpinner size="lg" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner.className).toContain('h-8 w-8');
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner.className).toContain('custom-class');
    });
  });

  describe('LoadingState', () => {
    it('should render children when not loading', () => {
      render(
        <LoadingState loading={false}>
          <div>Content loaded</div>
        </LoadingState>
      );
      
      expect(screen.getByText('Content loaded')).toBeDefined();
    });

    it('should render loading state', () => {
      render(
        <LoadingState loading={true}>
          <div>Content loaded</div>
        </LoadingState>
      );
      
      expect(screen.getByText('Loading...')).toBeDefined();
      expect(screen.queryByText('Content loaded')).toBeNull();
    });

    it('should render custom loading text', () => {
      render(
        <LoadingState loading={true} loadingText="Fetching data...">
          <div>Content loaded</div>
        </LoadingState>
      );
      
      expect(screen.getByText('Fetching data...')).toBeDefined();
    });

    it('should render error state', () => {
      render(
        <LoadingState loading={false} error="Something went wrong">
          <div>Content loaded</div>
        </LoadingState>
      );
      
      expect(screen.getByText('Error occurred')).toBeDefined();
      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(screen.queryByText('Content loaded')).toBeNull();
    });
  });

  describe('LoadingButton', () => {
    it('should render button with children', () => {
      render(
        <LoadingButton>
          Click me
        </LoadingButton>
      );
      
      expect(screen.getByText('Click me')).toBeDefined();
    });

    it('should show loading state', () => {
      render(
        <LoadingButton loading={true}>
          Click me
        </LoadingButton>
      );
      
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(screen.getByText('Click me')).toBeDefined();
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      
      render(
        <LoadingButton onClick={handleClick}>
          Click me
        </LoadingButton>
      );
      
      const button = screen.getByRole('button');
      button.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', () => {
      const handleClick = jest.fn();
      
      render(
        <LoadingButton loading={true} onClick={handleClick}>
          Click me
        </LoadingButton>
      );
      
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      
      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
