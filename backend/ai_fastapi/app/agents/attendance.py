import re
import secrets
from datetime import datetime, timedelta
from bson import ObjectId

def run_attendance_agent(message: str, user: dict, db) -> dict:
    text = message.strip()
    lower = text.lower()
    
    # Extract Course / Subject
    known_subjects = ["Data Structures", "Machine Learning", "Database Systems", "Algorithms", "Software Engineering"]
    course = ""
    for sub in known_subjects:
        if sub.lower() in lower:
            course = sub
            break
            
    user_subjects = user.get("subjects", [])
    if not course and user_subjects:
        course = user_subjects[0]
    elif not course:
        course_match = re.search(r'(?:for|subject)\s+([a-zA-Z\s]+?)(?:\s+lecture|\s+lab|\s+minutes|$)', text, re.IGNORECASE)
        course = course_match.group(1).strip() if course_match else "General Class"
        
    # Extract Session Type
    session_type = "Lecture"
    if "lab" in lower:
        session_type = "Lab"
    elif "tutorial" in lower:
        session_type = "Tutorial"
    elif "exam" in lower:
        session_type = "Exam"
        
    # Extract Duration
    duration = 60
    duration_match = re.search(r'(\d+)\s*(?:minutes|min|mins|hours|hr|hrs)', lower)
    if duration_match:
        amt = int(duration_match.group(1))
        if "hour" in lower or "hr" in lower:
            duration = amt * 60
        else:
            duration = amt
            
    # Calculate expiry
    expires_at = datetime.utcnow() + timedelta(minutes=duration)
    
    # Generate 32-byte hex secret
    secret = secrets.token_hex(32)
    
    # Save to MongoDB pymongo
    session_doc = {
        "faculty": ObjectId(user["id"]) if isinstance(user.get("id"), str) and len(user["id"]) == 24 else user.get("id"),
        "course": course,
        "sessionType": session_type,
        "qrToken": "DYNAMIC_CLIENT_SIDE",
        "secret": secret,
        "expiresAt": expires_at,
        "createdAt": datetime.utcnow(),
        "active": True
    }
    
    db.attendancesessions.insert_one(session_doc)
    
    expiry_str = expires_at.strftime("%I:%M:%S %p UTC")
    
    reply = (
        f"🤖 **Faculty Agent (Python)**: Active QR attendance session generated successfully.\n\n"
        f"*   **Subject**: {course}\n"
        f"*   **Type**: {session_type}\n"
        f"*   **Expiry**: {expiry_str}\n"
        f"*   **Status**: Live Dynamic QR refresh started.\n\n"
        f"Students can now scan the code on their dashboard to securely register presence."
    )
    
    return {
        "success": True,
        "actionTaken": "START_ATTENDANCE",
        "reply": reply
    }
