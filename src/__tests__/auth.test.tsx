import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '../test/test-utils';
import { mockFetch, mockApiResponse } from '../test/test-utils';
import LoginPage from '../app/(auth)/login/page';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

// Mock the useAuth hook
const mockLogin = jest.fn() as jest.MockedFunction<any>;
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    loading: false
  })
}));

describe('Login Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    
    // Setup default mock return values
    mockLogin.mockResolvedValue({ success: true });
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
  });

  it('should show validation error for empty fields', async () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Should show validation error
    expect(screen.getByText(/email and password are required/i)).toBeDefined();
  });

  it('should handle form submission', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Form should be processing
    expect(screen.getByText(/logging in/i)).toBeDefined();
  });

  it('should toggle password visibility', () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/show password/i);
    
    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
  });

  it('should have forgot password and register links', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/forgot password/i)).toBeDefined();
    expect(screen.getByText(/do not have an account/i)).toBeDefined();
  });
});
