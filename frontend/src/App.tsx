import React from 'react';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-background-secondary border-b border-slate-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Wazuh AI Assistant</h1>
            <p className="text-sm text-slate-400">Security analysis powered by AI</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
