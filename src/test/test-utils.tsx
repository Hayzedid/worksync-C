import { render, RenderOptions, waitFor, within } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Mock implementations for testing
const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  workspaces: []
};

const mockAuthContext = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: true,
  loading: false
};

// Simple wrapper without complex providers for now
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponse = {
  success: function<T>(data: T) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, data })
    };
  },
  error: (message: string, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ success: false, error: message })
  })
};

// Mock fetch
export const mockFetch = (response: any) => {
  global.fetch = jest.fn(() => Promise.resolve(response as Response));
};

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

export const createMockWorkspace = (overrides = {}) => ({
  id: 'workspace-1',
  name: 'Test Workspace',
  description: 'A test workspace',
  created_at: '2024-01-01T00:00:00.000Z',
  owner_id: 'test-user-1',
  ...overrides
});

export const createMockTask = (overrides = {}) => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  status: 'pending',
  priority: 'medium',
  due_date: '2024-12-31T23:59:59.000Z',
  workspace_id: 'workspace-1',
  assigned_to: 'test-user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockNote = (overrides = {}) => ({
  id: 'note-1',
  title: 'Test Note',
  content: 'This is a test note content',
  workspace_id: 'workspace-1',
  created_by: 'test-user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
});

// Async testing utilities
export const waitForLoading = async (getByText: any) => {
  await waitFor(() => {
    expect(getByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForError = async (getByText: any, errorMessage: string) => {
  await waitFor(() => {
    expect(getByText(errorMessage)).toBeInTheDocument();
  });
};

// Local storage testing utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// WebSocket testing utilities
export const mockWebSocket = () => {
  const mockSocket = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    readyState: WebSocket.OPEN
  };

  global.WebSocket = jest.fn(() => mockSocket) as any;
  return mockSocket;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };
