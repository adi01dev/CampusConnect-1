from .assignment import run_assignment_agent
from .attendance import run_attendance_agent
from .material import run_material_agent
from .query_response import run_query_response_agent
from .db_query import run_db_query_agent

def route_faculty_message(message: str, user: dict, db) -> dict:
    lower = message.lower()
    
    # 1. Database Query checks (Fetch queries)
    if (
        "how many" in lower or 
        "total" in lower or 
        "profile" in lower or 
        "details" in lower or 
        "find user" in lower or 
        "who is" in lower or
        "show assignments" in lower or 
        "list assignments" in lower or 
        "show mous" in lower or 
        "list mous" in lower or 
        "show partnerships" in lower or 
        "list partnerships" in lower or 
        "show agreements" in lower or 
        "list agreements" in lower
    ):
        return run_db_query_agent(message, user, db)
        
    # 2. Assignment creation
    if "assignment" in lower or "homework" in lower or "create task" in lower:
        return run_assignment_agent(message, user, db)
        
    # 3. QR Attendance session
    if "attendance" in lower or "qr session" in lower or "roll call" in lower:
        return run_attendance_agent(message, user, db)
        
    # 4. Material/Notes upload
    if "notes" in lower or "material" in lower or "resource" in lower or "slide" in lower:
        return run_material_agent(message, user, db)
        
    # 5. Query resolution
    if "reply" in lower or "respond" in lower or "answer" in lower:
        return run_query_response_agent(message, user, db)
        
    # 6. Default Fallback Instruction Chat
    fallback_reply = (
        "🤖 **Faculty Agent (Python)**: I can help you orchestrate classroom tasks or query the database in natural language. Try:\n\n"
        "**Classroom Commands**:\n"
        "*   *\"Create an assignment titled 'DBMS Normalization' on Database Systems due next Friday for 50 marks\"*\n"
        "*   *\"Start a lecture session for Data Structures of 45 minutes\"*\n"
        "*   *\"Upload notes for Algorithms titled 'Red-Black Trees' with description study trees first\"*\n"
        "*   *\"Reply to Ramesh saying yes, assignment due date is extended\"*\n\n"
        "**Database Query Commands**:\n"
        "*   *\"how many students are registered in the platform?\"*\n"
        "*   *\"list all assignments for Database Systems\"*\n"
        "*   *\"show profile details of Ramesh\"*\n"
        "*   *\"list institutional MoUs agreements\"*"
    )
    
    return {
        "success": True,
        "actionTaken": "NONE",
        "reply": fallback_reply
    }
