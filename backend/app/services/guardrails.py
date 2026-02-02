"""Guardrails for query validation"""
import logging
import re
from typing import Tuple

from app.config import settings

logger = logging.getLogger(__name__)


class GuardrailsChecker:
    """Validates queries against guardrails"""
    
    ALLOWED_TOPICS = [
        "wazuh", "siem", "security", "alert", "agent", "rule", "vulnerability",
        "cve", "compliance", "pci", "gdpr", "hipaa", "log", "event",
        "threat", "attack", "mitre", "att&ck", "malware", "intrusion",
        "file integrity", "fim", "monitoring", "detection", "incident",
        "forensics", "analysis", "firewall", "ids", "ips"
    ]
    
    BLOCKED_PATTERNS = [
        r'\b(weather|temperature|forecast)\b',
        r'\b(recipe|cooking|food|restaurant)\b',
        r'\b(movie|film|entertainment)\b',
        r'\b(sports|game|football|basketball)\b',
        r'\b(calculate|math|arithmetic)\b(?!.*security)',
        r'\b(joke|funny|humor)\b',
    ]
    
    def check(self, query: str) -> Tuple[bool, str]:
        """
        Check if query passes guardrails
        Returns: (is_valid, message)
        """
        if not settings.STRICT_GUARDRAILS:
            return True, ""
        
        query_lower = query.lower()
        
        # Check blocked patterns
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, query_lower):
                return False, self._get_rejection_message()
        
        # Check if contains allowed topics
        has_allowed_topic = any(
            topic in query_lower for topic in self.ALLOWED_TOPICS
        )
        
        if not has_allowed_topic and len(query.split()) > 3:
            # Long query without security keywords
            return False, self._get_rejection_message()
        
        return True, ""
    
    def _get_rejection_message(self) -> str:
        """Get rejection message"""
        return ("I can only assist with Wazuh SIEM and security monitoring questions. "
                "Please ask about security alerts, agents, rules, vulnerabilities, or related topics.")
