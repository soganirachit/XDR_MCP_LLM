"""Guardrails for query validation - Enhanced for follow-up questions"""
import logging
import re
from typing import Tuple, List, Dict

from app.config import settings

logger = logging.getLogger(__name__)


class GuardrailsChecker:
    """Validates queries against guardrails with context awareness"""

    ALLOWED_TOPICS = [
        # Wazuh specific
        "wazuh", "siem", "agent", "manager", "indexer", "cluster",
        # Security concepts
        "security", "alert", "rule", "vulnerability", "cve", "threat",
        "attack", "mitre", "att&ck", "malware", "intrusion", "incident",
        # Compliance
        "compliance", "pci", "gdpr", "hipaa", "nist", "audit",
        # Monitoring
        "log", "event", "monitoring", "detection", "forensics", "analysis",
        "file integrity", "fim", "ids", "ips", "firewall",
        # Technical terms
        "process", "port", "network", "connection", "ip", "host",
        "package", "software", "os", "system", "service",
        # Actions
        "show", "list", "get", "find", "check", "analyze", "investigate",
        "scan", "search", "report", "status", "health", "statistics"
    ]

    # Words that indicate follow-up questions
    FOLLOW_UP_INDICATORS = [
        "those", "these", "that", "this", "them", "it", "its",
        "the same", "mentioned", "above", "previous", "earlier",
        "what about", "how about", "and", "also", "more", "else",
        "any", "which", "who", "where", "when", "why", "how",
        "can you", "could you", "tell me", "show me"
    ]

    BLOCKED_PATTERNS = [
        r'\b(weather|temperature|forecast)\b',
        r'\b(recipe|cooking|food|restaurant)\b',
        r'\b(movie|film|entertainment)\b',
        r'\b(sports|game|football|basketball|soccer)\b',
        r'\b(joke|funny|humor)\b',
    ]

    def check(self, query: str, context: List[Dict] = None) -> Tuple[bool, str]:
        """
        Check if query passes guardrails
        Args:
            query: The user's query
            context: Previous conversation messages (optional)
        Returns: (is_valid, message)
        """
        if not settings.STRICT_GUARDRAILS:
            return True, ""

        query_lower = query.lower()

        # Check blocked patterns first
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, query_lower):
                return False, self._get_rejection_message()

        # Check if query contains allowed topics
        has_allowed_topic = any(
            topic in query_lower for topic in self.ALLOWED_TOPICS
        )

        # Check if this looks like a follow-up question
        is_follow_up = self._is_follow_up_question(query_lower)

        # Check if there's relevant context from previous conversation
        has_security_context = self._has_security_context(context) if context else False

        # Allow the query if:
        # 1. Contains allowed security topics, OR
        # 2. Is a short query (likely a follow-up), OR
        # 3. Is a follow-up question with security context, OR
        # 4. Has security context from previous messages
        if has_allowed_topic:
            return True, ""

        if len(query.split()) <= 5:
            # Short queries are likely follow-ups, allow them
            return True, ""

        if is_follow_up and has_security_context:
            # Follow-up question in security conversation
            return True, ""

        if has_security_context and not self._is_clearly_off_topic(query_lower):
            # Has security context and not clearly off-topic
            return True, ""

        # Block if no security relevance found
        return False, self._get_rejection_message()

    def _is_follow_up_question(self, query: str) -> bool:
        """Check if the query appears to be a follow-up question"""
        return any(indicator in query for indicator in self.FOLLOW_UP_INDICATORS)

    def _has_security_context(self, context: List[Dict]) -> bool:
        """Check if previous messages contain security-related content"""
        if not context:
            return False

        # Check last few messages for security topics
        recent_messages = context[-6:] if len(context) > 6 else context

        for msg in recent_messages:
            content = msg.get("content", "").lower()
            if any(topic in content for topic in self.ALLOWED_TOPICS[:20]):  # Check main security topics
                return True

        return False

    def _is_clearly_off_topic(self, query: str) -> bool:
        """Check if query is clearly off-topic (not just missing keywords)"""
        off_topic_indicators = [
            "tell me a story", "write a poem", "help me with homework",
            "translate", "summarize this article", "explain quantum"
        ]
        return any(indicator in query for indicator in off_topic_indicators)

    def _get_rejection_message(self) -> str:
        """Get rejection message"""
        return ("I can only assist with Wazuh SIEM and security monitoring questions. "
                "Please ask about security alerts, agents, rules, vulnerabilities, or related topics.")
