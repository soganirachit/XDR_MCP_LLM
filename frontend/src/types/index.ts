export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  components?: ThesysComponent[];
  timestamp: Date;
}

export interface ThesysComponent {
  type: 'text' | 'alert-cards' | 'agent-dashboard' | 'chart' | 'table' | 'timeline' | 'metrics';
  data: Record<string, any>;
  config?: Record<string, any>;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  components: ThesysComponent[];
  timestamp: string;
  tool_calls_made: number;
  processing_time_ms?: number;
}
