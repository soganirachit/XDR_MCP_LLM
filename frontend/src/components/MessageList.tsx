import React from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Wazuh AI Assistant
          </h2>
          <p className="text-slate-400">
            Ask me about security alerts, agent status, vulnerabilities, or any
            Wazuh SIEM related questions.
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-500">
            <p>💡 Try asking:</p>
            <ul className="text-left space-y-1">
              <li>• "Show me critical alerts from the last 24 hours"</li>
              <li>• "What's the status of my agents?"</li>
              <li>• "Find vulnerabilities with high CVSS scores"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default MessageList;
