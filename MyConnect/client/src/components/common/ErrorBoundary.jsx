import React, { useEffect, useState } from "react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      // Update state to indicate error
      setHasError(true);
      // Log error to an error reporting service
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    };

    // Assign error handler to global error event
    window.addEventListener("error", errorHandler);

    return () => {
      // Cleanup by removing the error handler
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  // If an error occurred, render an error message
  if (hasError) {
    return <div>Oops! Something went wrong.</div>;
  }

  // Otherwise, render children as usual
  return children;
};

export default ErrorBoundary;
