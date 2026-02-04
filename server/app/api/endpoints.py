import json
import asyncio
import threading
from queue import Queue
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.model.schemas import ScoutRequest, ScoutResponse
from scouthire_mas.crew import run_scouthire_crew

router = APIRouter()

@router.post("/scout")
async def scout_jobs(request: ScoutRequest):
    def event_generator():
        q = Queue()
        
        def step_callback(step):
            # Capture step information. CrewAI steps vary, but we'll try to get the text.
            try:
                # 'step' is usually a StepObject or similar
                msg = f"Agent working..."
                if hasattr(step, 'description'):
                    msg = step.description
                elif isinstance(step, str):
                    msg = step
                
                q.put(json.dumps({"type": "step", "content": str(msg)}))
            except:
                q.put(json.dumps({"type": "step", "content": "Agent processing step..."}))

        def run_crew():
            try:
                result = run_scouthire_crew(
                    query=request.query,
                    location=request.location,
                    candidate_profile=request.candidate_profile,
                    step_callback=step_callback
                )
                q.put(json.dumps({"type": "result", "content": result}))
            except Exception as e:
                q.put(json.dumps({"type": "error", "content": str(e)}))
            finally:
                q.put(None) # Signal end

        # Start crew in a background thread
        thread = threading.Thread(target=run_crew)
        thread.start()

        while True:
            item = q.get()
            if item is None:
                break
            yield f"data: {item}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
