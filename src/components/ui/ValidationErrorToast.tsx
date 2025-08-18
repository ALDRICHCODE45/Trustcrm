import { AlertCircle, X } from "lucide-react";

interface ValidationErrorToastProps {
  title: string;
  message: string;
  reason?: string;
  onClick: () => void;
}

export const ValidationErrorToast = ({
  title,
  message,
  reason,
  onClick,
}: ValidationErrorToastProps) => {
  return (
    <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-700 mb-2">{message}</p>
            {reason && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-xs text-red-800 leading-relaxed">{reason}</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClick}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
