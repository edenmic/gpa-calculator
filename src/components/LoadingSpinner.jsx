import { Calculator } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-white animate-pulse" />
        </div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
