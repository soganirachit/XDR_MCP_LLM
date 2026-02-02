import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-700 bg-background-secondary p-6">
      <div className="max-w-4xl mx-auto flex gap-4 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about Wazuh security alerts, agents, vulnerabilities..."
          disabled={disabled}
          className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default InputArea;
