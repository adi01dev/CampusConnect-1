import re
from datetime import datetime
from bson import ObjectId

def run_db_query_agent(message: str, user: dict, db) -> dict:
    text = message.strip()
    lower = text.lower()
    
    # Security whitelist definitions
    ALLOWED_COLLECTIONS = ["users", "assignments", "mous", "queries", "materials", "attendancesessions"]
    SENSITIVE_KEYS = ["passwordHash", "refreshToken", "resetPasswordToken", "resetPasswordExpiresAt"]
    
    reply = ""
    success = False
    
    try:
        # Case 1: Count metric queries (e.g. "how many...", "total...")
        if "how many" in lower or "total" in lower:
            target_collection = ""
            query_filter = {}
            label = ""
            
            if "student" in lower:
                target_collection = "users"
                query_filter = {"role": "Student"}
                label = "registered students"
            elif "faculty" in lower or "teacher" in lower:
                target_collection = "users"
                query_filter = {"role": "Faculty"}
                label = "active faculty members"
            elif "admin" in lower:
                target_collection = "users"
                query_filter = {"role": "Admin"}
                label = "platform administrators"
            elif "user" in lower or "account" in lower:
                target_collection = "users"
                query_filter = {}
                label = "active platform users"
            elif "assignment" in lower:
                target_collection = "assignments"
                query_filter = {}
                label = "uploaded assignments"
            elif "mou" in lower or "partnership" in lower or "agreement" in lower:
                target_collection = "mous"
                query_filter = {}
                label = "institutional partnerships (MoUs)"
            elif "query" in lower or "ticket" in lower or "inquiry" in lower:
                target_collection = "queries"
                query_filter = {}
                label = "student queries"
                
            if target_collection in ALLOWED_COLLECTIONS:
                count = db[target_collection].count_documents(query_filter)
                reply = (
                    f"🤖 **Database Query Agent (Python)**: I ran a database count query successfully.\n\n"
                    f"📊 **Result**: There are currently **{count}** {label} recorded in the system database."
                )
                success = True
                
        # Case 2: Search and listing assignments
        elif "assignment" in lower or "homework" in lower:
            known_subjects = ["Data Structures", "Machine Learning", "Database Systems", "Algorithms", "Software Engineering"]
            subject = ""
            for sub in known_subjects:
                if sub.lower() in lower:
                    subject = sub
                    break
                    
            query_filter = {}
            if subject:
                query_filter = {"subject": subject}
                
            assignments = list(db.assignments.find(query_filter).sort("dueDate", 1))
            
            if not assignments:
                reply = "🤖 **Database Query Agent (Python)**: No assignments found in the database."
            else:
                reply = f"🤖 **Database Query Agent (Python)**: Found **{len(assignments)}** assignment(s) in the database:\n\n"
                reply += "| Title | Subject | Total Marks | Due Date |\n"
                reply += "| :--- | :--- | :---: | :--- |\n"
                for a in assignments:
                    due_str = a.get("dueDate", "")
                    try:
                        dt = datetime.fromisoformat(due_str.replace("Z", ""))
                        due_formatted = dt.strftime("%b %d, %Y")
                    except:
                        due_formatted = due_str
                    reply += f"| {a.get('title')} | {a.get('subject')} | {a.get('totalMarks')} | {due_formatted} |\n"
            success = True

        # Case 3: Search and view user details/profiles
        elif "profile" in lower or "details" in lower or "find user" in lower or "who is" in lower:
            name_match = re.search(r'(?:of|for|find|is)\s+([a-zA-Z\s]+?)(?:\?|$)', text, re.IGNORECASE)
            name = name_match.group(1).strip() if name_match else ""
            
            if not name:
                reply = "🤖 **Database Query Agent (Python)**: Please specify the user name you are searching for (e.g. *show details of Ramesh*)."
            else:
                query_filter = {"name": re.compile(name, re.IGNORECASE)}
                matching_users = list(db.users.find(query_filter))
                
                if not matching_users:
                    reply = f"🤖 **Database Query Agent (Python)**: No users matching name \"{name}\" found in the database."
                else:
                    reply = f"🤖 **Database Query Agent (Python)**: Found **{len(matching_users)}** user record(s) matching your request:\n\n"
                    for u in matching_users:
                        # Strip sensitive data
                        for sk in SENSITIVE_KEYS:
                            u.pop(sk, None)
                        
                        reply += f"### 👤 Profile: {u.get('name')}\n"
                        reply += f"*   **Email**: `{u.get('email')}`\n"
                        reply += f"*   **Role**: **{u.get('role')}**\n"
                        if u.get("department"):
                            reply += f"*   **Department**: {u.get('department')}\n"
                        if u.get("semester"):
                            reply += f"*   **Semester**: {u.get('semester')}\n"
                        if u.get("isMoUCoordinator"):
                            reply += f"*   **Special Designation**: MoU Coordinator\n"
                        reply += "\n"
            success = True
            
        # Case 4: Search institutional partnerships
        elif "mou" in lower or "partnership" in lower or "agreement" in lower:
            mous = list(db.mous.find().sort("submittedDate", -1))
            
            if not mous:
                reply = "🤖 **Database Query Agent (Python)**: No institutional partnerships recorded."
            else:
                reply = f"🤖 **Database Query Agent (Python)**: Query resolved. Found **{len(mous)}** partnership agreement(s):\n\n"
                reply += "| Organization | Type | Status | Coordinator |\n"
                reply += "| :--- | :--- | :---: | :--- |\n"
                for m in mous:
                    reply += f"| {m.get('organization')} | {m.get('type')} | **{m.get('status').upper()}** | {m.get('submittedBy', 'Unassigned')} |\n"
            success = True
            
        if not success:
            reply = (
                "🤖 **Database Query Agent (Python)**: I can securely run database count and search queries. Try asking me:\n\n"
                "*   *\"how many students are registered in the platform?\"*\n"
                "*   *\"list all assignments for Database Systems\"*\n"
                "*   *\"show profile details of Ramesh\"*\n"
                "*   *\"list institutional MoUs agreements\"*"
            )
            success = True
            
    except Exception as e:
        reply = f"🤖 **Database Query Agent (Python)**: An error occurred while executing the query: {str(e)}"
        success = False
        
    return {
        "success": success,
        "actionTaken": "NONE",
        "reply": reply
    }
