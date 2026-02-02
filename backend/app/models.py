"""Pydantic models for request/response validation"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    session_id: str = Field(..., description="Unique session identifier")
    message: str = Field(..., min_length=1, description="User message")


class ThesysComponent(BaseModel):
    """thesys UI component specification"""
    type: Literal["text", "alert-cards", "agent-dashboard", "chart", "table", "timeline", "metrics"]
    data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    session_id: str
    message: str
    components: List[ThesysComponent]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls_made: int = 0
    processing_time_ms: Optional[float] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    mcp_connected: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
