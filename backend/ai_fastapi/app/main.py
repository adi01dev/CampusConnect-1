import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
from dotenv import load_dotenv

# Add parent directories to sys.path to guarantee robust module resolution
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.abspath(os.path.join(current_dir, "..")))
sys.path.append(current_dir)

try:
    from app.agents.router import route_faculty_message
except ImportError:
    from agents.router import route_faculty_message


# Load environment variables from the shared backend/.env
# Since main.py runs in the context of backend/ai_fastapi, we traverse up to find backend/.env
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI(title="CampusConnect Faculty NLU Agent API")

# Connect to MongoDB
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    # Fallback to local if undefined
    mongo_uri = "mongodb://localhost:27017/campusconnect"

print("Bootstrapping PyMongo client...")
client = MongoClient(mongo_uri)
# Get database name from connection string or default to "campusconnect"
db = client.get_default_database()
if db is None:
    db = client["campusconnect"]
print(f"Connected to database: {db.name}")

class AgentRequest(BaseModel):
    message: str
    user: dict

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/agent")
def handle_agent_request(payload: AgentRequest):
    try:
        response = route_faculty_message(payload.message, payload.user, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent internal processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
