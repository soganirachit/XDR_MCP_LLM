"""In-memory session management"""
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from app.config import settings

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages conversation sessions in memory"""
    
    def __init__(self):
        self.sessions: Dict[str, List[Dict]] = defaultdict(list)
        self.last_activity: Dict[str, datetime] = {}
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add message to session"""
        self.sessions[session_id].append({
            "role": role,
            "content": content
        })
        self.last_activity[session_id] = datetime.utcnow()
        
        # Keep only last N messages
        max_messages = settings.SESSION_MAX_MESSAGES * 2  # user + assistant pairs
        if len(self.sessions[session_id]) > max_messages:
            self.sessions[session_id] = self.sessions[session_id][-max_messages:]
    
    def get_context(self, session_id: str) -> List[Dict]:
        """Get session context"""
        return self.sessions.get(session_id, [])
    
    def cleanup_old_sessions(self):
        """Remove inactive sessions"""
        cutoff = datetime.utcnow() - timedelta(minutes=settings.SESSION_TIMEOUT_MINUTES)
        
        expired_sessions = [
            sid for sid, last_time in self.last_activity.items()
            if last_time < cutoff
        ]
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
            del self.last_activity[session_id]
            logger.info(f"Cleaned up session: {session_id}")


# Global instance
session_manager = SessionManager()
