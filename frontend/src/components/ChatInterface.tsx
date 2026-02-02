import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Shield, Activity, AlertTriangle, Server } from 'lucide-react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { sendMessage } from '../utils/api';
import type { Message } from '../types';

interface ChatInterfaceProps {
  sessionId?: string;
  onFirstMessage?: (title: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: AlertTriangle,
    label: 'Critical Alerts',
    prompt: 'Show me critical security alerts from the last 24 hours',
  },
  {
    icon: Server,
    label: 'Agent Status',
    prompt: 'List all active Wazuh agents and their current status',
  },
  {
    icon: Shield,
    label: 'Top Vulnerabilities',
    prompt: 'What are the top vulnerabilities in my environment?',
  },
  {
    icon: Activity,
    label: 'Security Summary',
    prompt: 'Give me a summary of today\'s security events',
  },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId: propSessionId, onFirstMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => propSessionId || uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Update chat title on first message
    if (messages.length === 0 && onFirstMessage) {
      const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      onFirstMessage(title);
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call backend API
      const response = await sendMessage(sessionId, text);

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message,
        components: response.components,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome screen when no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Welcome Text */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
              Wazuh Security Assistant
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto">
              Your AI-powered security analyst for Wazuh SIEM
            </p>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-2xl mb-8 sm:mb-12">
            <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>

          {/* Quick Prompts - 2x2 Grid */}
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {QUICK_PROMPTS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="flex items-center gap-3 p-4 bg-white border border-sidebar-border rounded-xl text-left hover:border-primary hover:bg-primary-50 transition-all group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sidebar-border bg-white p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
