import React from 'react';
import { AlertTriangle, Server, RefreshCw } from 'lucide-react';

interface BackendErrorProps {
  error?: Error;
  retry?: () => void;
  className?: string;
}

export function BackendError({ error, retry, className = '' }: BackendErrorProps) {
  const isNetworkError = error?.message.includes('Backend server not running') || 
                         error?.message.includes('Failed to fetch') ||
                         error?.message.includes('Unable to connect');

  if (!isNetworkError) {
    // This is not a backend connectivity issue, show generic error
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || 'Something went wrong. Please try again.'}
            </p>
            {retry && (
              <button
                onClick={retry}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // This is a backend connectivity issue, show helpful development message
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-6 ${className}`}>
      <div className="flex items-start">
        <Server className="h-6 w-6 text-amber-600 mr-4 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Backend Server Required</h3>
          <p className="text-amber-800 mb-4">
            This application requires a backend API server to be running on <code className="px-1 py-0.5 bg-amber-100 rounded text-sm font-mono">localhost:4100</code>.
          </p>
          
          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <h4 className="font-medium">To start the backend server:</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 pl-4">
                <li>Review the <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">BACKEND_REQUIREMENTS.md</code> file</li>
                <li>Set up a Node.js backend server with the required API endpoints</li>
                <li>Start the server on port 4100</li>
                <li>Ensure the server supports the API routes defined in the frontend</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium">API Base URL:</h4>
              <code className="px-2 py-1 bg-amber-100 rounded font-mono text-xs">
                {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100/api'}
              </code>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {retry && (
              <button
                onClick={retry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Check Connection
              </button>
            )}
            <a
              href="/login"
              className="text-amber-700 hover:text-amber-900 font-medium underline"
            >
              Continue to Login (will show error)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
