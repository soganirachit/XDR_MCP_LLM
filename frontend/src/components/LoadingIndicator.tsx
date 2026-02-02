import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">🤖</span>
      </div>
      <div className="flex-1 max-w-3xl">
        <div className="inline-block bg-background-secondary rounded-2xl px-6 py-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
