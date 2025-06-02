import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

const ErrorAlert = ({ error, message, onRetry }) => {
  const errorMessage = error || message;
  if (!errorMessage) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-start">
        <div className="whitespace-pre-line flex-1">{errorMessage}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:no-underline mr-2 flex-shrink-0"
          >
            נסה שוב
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
