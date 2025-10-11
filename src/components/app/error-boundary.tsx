"use client";

import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";
import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
  errorId: string | null;
}

// Memoized error details component
const ErrorDetails = memo(({ error }: { error: Error }) => (
  <details className="mb-6 text-left max-w-full">
    <summary className="cursor-pointer text-sm font-medium mb-2 flex items-center gap-2">
      <Bug className="h-4 w-4" />
      Detail Kesalahan (Pengembangan)
    </summary>
    <div className="space-y-2">
      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-w-full">
        {error.message}
      </pre>
      {error.stack && (
        <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-w-full">
          {error.stack}
        </pre>
      )}
    </div>
  </details>
));

ErrorDetails.displayName = "ErrorDetails";

// Memoized action buttons component
const ActionButtons = memo(
  ({
    canRetry,
    retryCount,
    maxRetries,
    onRetry,
  }: {
    canRetry: boolean;
    retryCount: number;
    maxRetries: number;
    onRetry: () => void;
  }) => {
    const handleHomeClick = useCallback(() => {
      window.location.href = "/";
    }, []);

    return (
      <div className="flex gap-3">
        {canRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba lagi {retryCount > 0 && `(${retryCount}/${maxRetries})`}
          </Button>
        )}
        <Button variant="outline" onClick={handleHomeClick} className="gap-2">
          <Home className="h-4 w-4" />
          Kembali ke beranda
        </Button>
      </div>
    );
  },
);

ActionButtons.displayName = "ActionButtons";

// Optimized error boundary class
class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you would send this to an error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const _errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      errorId: this.state.errorId,
    };

    // TODO: Send _errorReport to error monitoring service
    console.log("Error report prepared:", _errorReport);
  };

  resetError = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorId: null });
    }
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error ?? new Error("Unknown error occurred")}
            resetError={this.resetError}
          />
        );
      }

      const canRetry = this.retryCount < this.maxRetries;
      const isProduction = process.env.NODE_ENV === "production";

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {canRetry ? "Terjadi kesalahan" : "Tidak dapat memulihkan"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {canRetry
              ? "Kami mengalami kesalahan yang tidak terduga. Silakan coba lagi atau hubungi dukungan jika masalah berlanjut."
              : "Kami telah mencoba beberapa kali tetapi tidak dapat menyelesaikan masalah. Silakan muat ulang halaman atau hubungi dukungan."}
          </p>

          {/* Error details for development */}
          {!isProduction && this.state.error && (
            <ErrorDetails error={this.state.error} />
          )}

          {/* Action buttons */}
          <ActionButtons
            canRetry={canRetry}
            retryCount={this.retryCount}
            maxRetries={this.maxRetries}
            onRetry={this.resetError}
          />

          {/* Error ID for support */}
          {this.state.errorId && (
            <p className="text-xs text-muted-foreground mt-4">
              ID Kesalahan: {this.state.errorId}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Memoized wrapper component
export const ErrorBoundary = memo(
  ({ children, ...props }: ErrorBoundaryProps) => (
    <ErrorBoundaryClass {...props}>{children}</ErrorBoundaryClass>
  ),
);

ErrorBoundary.displayName = "ErrorBoundary";

// Hook for handling async errors in components
export const useErrorHandler = () => {
  return useCallback((error: Error) => {
    console.error("Async error:", error);
    throw error;
  }, []);
};
