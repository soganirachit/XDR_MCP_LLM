import React from 'react';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import ThesysRenderer from './ThesysRenderer';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary' : 'bg-slate-700'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block rounded-2xl px-6 py-4 ${
            isUser
              ? 'bg-primary text-white'
              : 'bg-background-secondary text-slate-100'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* thesys components */}
        {message.components && message.components.length > 0 && (
          <div className="mt-4 space-y-4">
            {message.components.map((component, index) => (
              <ThesysRenderer key={index} component={component} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-2 text-xs text-slate-500">
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
