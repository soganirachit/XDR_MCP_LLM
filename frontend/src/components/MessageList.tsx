import React from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  );
};

export default MessageList;
