"use client";

import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";
import React from "react";
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

class ErrorBoundaryClass extends React.Component<
 ErrorBoundaryProps,
 ErrorBoundaryState
> {
 private retryCount = 0;
 private maxRetries = 3;

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
  const errorReport = {
   message: error.message,
   stack: error.stack,
   componentStack: errorInfo.componentStack,
   timestamp: new Date().toISOString(),
   userAgent: navigator.userAgent,
   url: window.location.href,
   errorId: this.state.errorId,
  };

  console.log("Error report:", errorReport);

  // Example: Send to monitoring service
  // errorMonitoringService.captureException(error, { extra: errorReport });
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
      error={this.state.error!}
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
      <details className="mb-6 text-left max-w-full">
       <summary className="cursor-pointer text-sm font-medium mb-2 flex items-center gap-2">
        <Bug className="h-4 w-4" />
        Detail Kesalahan (Pengembangan)
       </summary>
       <div className="space-y-2">
        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-w-full">
         {this.state.error.message}
        </pre>
        {this.state.error.stack && (
         <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-w-full">
          {this.state.error.stack}
         </pre>
        )}
       </div>
      </details>
     )}

     {/* Action buttons */}
     <div className="flex gap-3">
      {canRetry && (
       <Button onClick={this.resetError} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Coba lagi{" "}
        {this.retryCount > 0 && `(${this.retryCount}/${this.maxRetries})`}
       </Button>
      )}
      <Button
       variant="outline"
       onClick={() => (window.location.href = "/")}
       className="gap-2"
      >
       <Home className="h-4 w-4" />
       Kembali ke beranda
      </Button>
     </div>

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

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
 return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}

// Hook for handling async errors in components
export function useErrorHandler() {
 return (error: Error) => {
  console.error("Async error:", error);
  throw error;
 };
}
