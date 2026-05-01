import { ReactNode, useEffect, useState } from "react";

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      setHasError(true);
      console.error("Error caught by ErrorBoundary:", error);
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  if (hasError) {
    return <div>Oops! Something went wrong.</div>;
  }

  return children;
};

export default ErrorBoundary;
