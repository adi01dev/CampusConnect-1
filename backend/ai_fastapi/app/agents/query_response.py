import re
from datetime import datetime
from bson import ObjectId

def run_query_response_agent(message: str, user: dict, db) -> dict:
    text = message.strip()
    lower = text.lower()
    
    # Extract student name
    student_name = ""
    student_match = re.search(r'(?:to|student)\s+([a-zA-Z]+)(?:\s+|\'s|$)', text, re.IGNORECASE)
    if student_match:
        student_name = student_match.group(1).strip().lower()
        
    # Extract reply text
    reply_text = ""
    reply_match = re.search(r'(?:saying|with|reply)\s+(.+)', text, re.IGNORECASE)
    if reply_match:
        reply_text = reply_match.group(1).strip()
        
    if not reply_text:
        return {
            "success": False,
            "reply": "🤖 **Faculty Agent (Python)**: Please specify what reply message you want me to send (e.g., *reply to Ramesh saying yes, the deadline is extended*)."
        }
        
    # Query MongoDB for matching open query
    faculty_id = user.get("id")
    if isinstance(faculty_id, str) and len(faculty_id) == 24:
        faculty_id = ObjectId(faculty_id)
        
    query_filter = {"facultyId": faculty_id, "status": {"$ne": "resolved"}}
    
    queries = list(db.queries.find(query_filter))
    
    matching_query = None
    if student_name:
        for q in queries:
            if student_name in q.get("studentName", "").lower():
                matching_query = q
                break
                
    if not matching_query and queries:
        matching_query = queries[0]
        
    if not matching_query:
        student_phrase = f" from \"{student_name}\"" if student_name else ""
        return {
            "success": False,
            "reply": f"🤖 **Faculty Agent (Python)**: I searched your assigned queries but couldn't find any pending/unresolved student inquiries{student_phrase}."
        }
        
    # Execute update in MongoDB
    reply_obj = {
        "from": user.get("name", "Faculty Member"),
        "message": reply_text,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    db.queries.update_one(
        {"_id": matching_query["_id"]},
        {
            "$set": {
                "replyText": reply_text,
                "status": "resolved",
                "repliedAt": datetime.utcnow()
            },
            "$push": {
                "replies": reply_obj
            }
        }
    )
    
    reply_msg = (
        f"🤖 **Faculty Agent (Python)**: Inquiry resolved successfully.\n\n"
        f"*   **Student**: {matching_query.get('studentName')}\n"
        f"*   **Query**: *\"{matching_query.get('queryText')}\"*\n"
        f"*   **Your Reply**: *\"{reply_text}\"*\n"
        f"*   **Status**: Marked as Resolved\n\n"
        f"The student has been updated on their dashboard."
    )
    
    return {
        "success": True,
        "actionTaken": "REPLY_QUERY",
        "reply": reply_msg
    }
