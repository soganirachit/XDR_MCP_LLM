import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">W</span>
        </div>

        {/* Loading content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text-primary">Wazuh Assistant</span>
            <span className="text-xs text-text-muted">thinking...</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
              />
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
              />
              <div
                className="w-2 h-2 bg-primary-300 rounded-full animate-bounce"
                style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
              />
            </div>
            <span className="text-sm text-text-muted">Analyzing your request...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
