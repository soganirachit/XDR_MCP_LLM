import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-3 bg-white border border-sidebar-border rounded-2xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about security alerts, vulnerabilities, agents..."
          disabled={disabled}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base leading-relaxed min-h-[24px] max-h-[120px]"
          rows={1}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 p-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-text-muted mt-2 text-center">
        Press Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
};

export default InputArea;
