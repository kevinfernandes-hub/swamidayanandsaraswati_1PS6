from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import backend_logic

import logging

# Configure logging to file
logging.basicConfig(
    filename='server.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Smart Roadside Assistance API")

# CORS Configuration - Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.info("Server starting up...")

# Request Models
class Location(BaseModel):
    lat: float
    lon: float

class AssistanceRequest(BaseModel):
    user_text: str
    user_location: Optional[Location] = None
    request_count_last_10_min: Optional[int] = 0
    cancel_count_today: Optional[int] = 0

# Response Models
class AssistanceResponse(BaseModel):
    message: str
    status: str
    priority: Optional[str] = None
    mechanic_id: Optional[str] = None
    eta_minutes: Optional[int] = None
    issue_type: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "Smart Roadside Assistance API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "connected", "backend_port": 8000}

@app.post("/api/request-assistance", response_model=AssistanceResponse)
def request_assistance(request: AssistanceRequest):
    """
    Handle roadside assistance requests.
    Processes user input and returns mechanic assignment details.
    """
    logging.info(f"Received request: {request}")
    try:
        # Convert Pydantic model to dict for backend_logic
        data = {
            "user_text": request.user_text,
            "request_count_last_10_min": request.request_count_last_10_min,
            "cancel_count_today": request.cancel_count_today,
        }
        
        # Convert Location to dict if present
        if request.user_location:
            data["user_location"] = {
                "lat": request.user_location.lat,
                "lon": request.user_location.lon
            }
        else:
            data["user_location"] = None
        
        logging.debug(f"Calling backend_logic with data: {data}")
        
        # Call backend logic
        result = backend_logic.handle_assistance_request(data)
        
        logging.info(f"Backend result: {result}")
        
        return AssistanceResponse(**result)
    
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/api/status/{distance_meters}")
def get_status(distance_meters: int):
    """
    Get live status based on distance.
    """
    try:
        status = backend_logic.get_live_status(distance_meters)
        return {"status": status, "distance_meters": distance_meters}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
