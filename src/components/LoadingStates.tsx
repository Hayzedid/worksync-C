import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={`animate-spin text-[#0FC2C0] ${sizeClasses[size]} ${className}`}
    />
  );
};

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  children,
  loadingText = 'Loading...',
  className = '',
  size = 'md'
}) => {
  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Error occurred</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size={size} className="mx-auto mb-3" />
          <p className="text-[#015958] font-medium">{loadingText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Page-level loading component
export const PageLoading: React.FC<{ text?: string }> = ({ 
  text = 'Loading page...' 
}) => (
  <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-[#015958] text-lg font-medium">{text}</p>
    </div>
  </div>
);

// Button loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`
      flex items-center justify-center gap-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {loading && <LoadingSpinner size="sm" />}
    {children}
  </button>
);

// Skeleton loading components
export const SkeletonLine: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`animate-pulse bg-gray-200 rounded h-4 ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow p-6">
    <div className="flex items-center space-x-4 mb-4">
      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      <div className="space-y-2 flex-1">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-5/6" />
      <SkeletonLine className="h-3 w-4/6" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
    <div className="bg-gray-50 px-6 py-3">
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLine key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((j) => (
            <SkeletonLine key={j} className="h-3 w-24" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
