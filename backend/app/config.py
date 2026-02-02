"""Configuration management using environment variables"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 4096
    OPENAI_TIMEOUT: int = 30
    
    # MCP Server Configuration
    MCP_SERVER_URL: str = "http://host.docker.internal:3000"
    MCP_CONNECTION_TIMEOUT: int = 10
    MCP_REQUEST_TIMEOUT: int = 30
    MCP_MAX_RETRIES: int = 3
    
    # Backend Configuration
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Session Management
    SESSION_MAX_MESSAGES: int = 10
    SESSION_TIMEOUT_MINUTES: int = 60
    SESSION_CLEANUP_INTERVAL: int = 15
    
    # LLM Orchestration
    MAX_TOOL_ITERATIONS: int = 5
    ENABLE_STREAMING: bool = False
    
    # Guardrails
    STRICT_GUARDRAILS: bool = True
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3001,http://localhost:3000"
    
    # Performance
    MAX_CONCURRENT_REQUESTS: int = 10
    RATE_LIMIT_PER_MINUTE: int = 30
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
