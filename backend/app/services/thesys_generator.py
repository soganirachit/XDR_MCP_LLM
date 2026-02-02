"""thesys UI component generator
Converts LLM responses into thesys component specifications"""
import logging
import re
from typing import Dict, Any, List

from app.models import ThesysComponent

logger = logging.getLogger(__name__)


class ThesysGenerator:
    """Generates thesys UI components from LLM responses"""
    
    def generate_components(self, llm_result: Dict[str, Any]) -> List[ThesysComponent]:
        """
        Generate thesys components based on LLM response
        Detects data type and creates appropriate visualizations
        """
        message = llm_result.get("message", "")
        raw_data = llm_result.get("raw_data", {})
        
        components = []
        
        # Detect component type from message tags or data structure
        if "[ALERTS]" in message or "alerts" in raw_data:
            components.append(self._create_alert_cards(raw_data.get("alerts", [])))
        
        elif "[AGENTS]" in message or "agents" in raw_data:
            components.append(self._create_agent_dashboard(raw_data.get("agents", [])))
        
        elif "[VULNERABILITIES]" in message or "vulnerabilities" in raw_data:
            components.append(self._create_vulnerability_table(raw_data.get("vulnerabilities", [])))
        
        elif "[METRICS]" in message or "metrics" in raw_data:
            components.append(self._create_metrics_chart(raw_data.get("metrics", {})))
        
        elif "[RULES]" in message or "rules" in raw_data:
            components.append(self._create_rule_cards(raw_data.get("rules", [])))
        
        elif "[FILES]" in message or "files" in raw_data:
            components.append(self._create_file_tree(raw_data.get("files", [])))
        
        # Always include text component for the message
        clean_message = re.sub(r'\[(ALERTS|AGENTS|VULNERABILITIES|METRICS|RULES|FILES)\]', '', message)
        components.insert(0, ThesysComponent(
            type="text",
            data={"text": clean_message.strip()},
            config={}
        ))
        
        return components
    
    def _create_alert_cards(self, alerts: List[Dict]) -> ThesysComponent:
        """Create alert cards component"""
        return ThesysComponent(
            type="alert-cards",
            data={"alerts": alerts},
            config={
                "severityColors": {
                    "critical": "#ef4444",
                    "high": "#f97316",
                    "medium": "#eab308",
                    "low": "#3b82f6"
                }
            }
        )
    
    def _create_agent_dashboard(self, agents: List[Dict]) -> ThesysComponent:
        """Create agent dashboard component"""
        return ThesysComponent(
            type="agent-dashboard",
            data={"agents": agents},
            config={
                "statusColors": {
                    "active": "#10b981",
                    "disconnected": "#ef4444",
                    "pending": "#eab308"
                }
            }
        )
    
    def _create_vulnerability_table(self, vulnerabilities: List[Dict]) -> ThesysComponent:
        """Create vulnerability table component"""
        return ThesysComponent(
            type="table",
            data={
                "columns": ["CVE", "Severity", "CVSS", "Package", "Affected Agents"],
                "rows": vulnerabilities
            },
            config={
                "sortable": True,
                "filterable": True
            }
        )
    
    def _create_metrics_chart(self, metrics: Dict) -> ThesysComponent:
        """Create metrics chart component"""
        return ThesysComponent(
            type="chart",
            data={
                "chartType": "bar",
                "data": [
                    {"label": k, "value": v}
                    for k, v in metrics.items()
                ]
            },
            config={
                "colors": ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]
            }
        )
    
    def _create_rule_cards(self, rules: List[Dict]) -> ThesysComponent:
        """Create rule cards component"""
        return ThesysComponent(
            type="alert-cards",  # Reuse alert cards for rules
            data={"alerts": rules},
            config={}
        )
    
    def _create_file_tree(self, files: List[Dict]) -> ThesysComponent:
        """Create file tree component"""
        return ThesysComponent(
            type="table",
            data={
                "columns": ["File Path", "Change Type", "Timestamp", "Agent"],
                "rows": files
            },
            config={}
        )
