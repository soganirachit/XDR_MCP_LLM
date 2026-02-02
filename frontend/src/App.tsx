import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from './components/ChatInterface';

function App() {
  const [sessionId] = useState(() => uuidv4());

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-sidebar-border px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
        <img
          src="/hawkeye-logo.png"
          alt="HawkEye"
          className="h-8 sm:h-10 w-auto"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface sessionId={sessionId} />
      </main>
    </div>
  );
}

export default App;
