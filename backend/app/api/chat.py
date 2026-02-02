"""Chat endpoint implementation"""
import logging
import time
from fastapi import HTTPException

from app.models import ChatRequest, ChatResponse
from app.services.llm_orchestrator import LLMOrchestrator
from app.services.guardrails import GuardrailsChecker
from app.services.session_manager import session_manager
from app.services.thesys_generator import ThesysGenerator

logger = logging.getLogger(__name__)


async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Process chat request and return response with thesys components
    """
    start_time = time.time()
    
    try:
        # Step 1: Get session context first (needed for context-aware guardrails)
        context = session_manager.get_context(request.session_id)

        # Step 2: Validate query with guardrails (pass context for follow-up awareness)
        guardrails = GuardrailsChecker()
        is_valid, rejection_message = guardrails.check(request.message, context)

        if not is_valid:
            logger.info(f"Query blocked by guardrails: {request.message[:50]}...")
            return ChatResponse(
                session_id=request.session_id,
                message=rejection_message,
                components=[{
                    "type": "text",
                    "data": {"text": rejection_message},
                    "config": {"style": "warning"}
                }],
                tool_calls_made=0
            )
        
        # Step 3: Process with LLM orchestrator (context already fetched above)
        orchestrator = LLMOrchestrator()
        result = await orchestrator.process(
            message=request.message,
            context=context,
            session_id=request.session_id
        )
        
        # Step 4: Generate thesys UI components
        thesys_gen = ThesysGenerator()
        components = thesys_gen.generate_components(result)
        
        # Step 5: Update session
        session_manager.add_message(request.session_id, "user", request.message)
        session_manager.add_message(request.session_id, "assistant", result["message"])
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(
            f"Chat processed in {processing_time:.2f}ms "
            f"({result['tool_calls_made']} tool calls)"
        )
        
        return ChatResponse(
            session_id=request.session_id,
            message=result["message"],
            components=components,
            tool_calls_made=result['tool_calls_made'],
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
