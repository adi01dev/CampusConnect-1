import re
from datetime import datetime, timedelta
from bson import ObjectId

def parse_relative_date(text: str) -> datetime:
    now = datetime.now()
    lower = text.lower()
    
    if "tomorrow" in lower:
        return now + timedelta(days=1)
        
    in_days_match = re.search(r"in (\d+) days?", lower)
    if in_days_match:
        days = int(in_days_match.group(1))
        return now + timedelta(days=days)
        
    days_of_week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    for i, day in enumerate(days_of_week):
        if f"next {day}" in lower:
            current_day = (now.weekday() + 1) % 7 # Python weekday: Mon=0, Sun=6. Map to Sun=0, Sat=6
            target_day = i
            days_to_add = target_day - current_day
            if days_to_add <= 0:
                days_to_add += 7
            return now + timedelta(days=days_to_add)
            
    iso_match = re.search(r"(\d{4})[-/](\d{2})[-/](\d{2})", lower)
    if iso_match:
        return datetime(int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3)))
        
    return now + timedelta(days=7)

def run_assignment_agent(message: str, user: dict, db) -> dict:
    text = message.strip()
    lower = text.lower()
    
    # Extract Title
    title = ""
    quote_match = re.search(r'["\']([^"\']+)["\']', text)
    if quote_match:
        title = quote_match.group(1)
    else:
        title_match = re.search(r'(?:titled|called|named)\s+([a-zA-Z0-9\s]+?)(?:\s+for|\s+due|\s+on|\s+with|$)', text, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "New Assignment"
        
    # Extract Subject
    known_subjects = ["Data Structures", "Machine Learning", "Database Systems", "Algorithms", "Software Engineering"]
    subject = ""
    for sub in known_subjects:
        if sub.lower() in lower:
            subject = sub
            break
            
    user_subjects = user.get("subjects", [])
    if not subject and user_subjects:
        subject = user_subjects[0]
    elif not subject:
        subject_match = re.search(r'(?:on|for|subject)\s+([a-zA-Z\s]+?)(?:\s+due|\s+marks|\s+instructions|$)', text, re.IGNORECASE)
        subject = subject_match.group(1).strip() if subject_match else "General"
        
    # Extract Due Date
    due_date = parse_relative_date(lower)
    
    # Extract Marks
    total_marks = 100
    marks_match = re.search(r'(?:for|of)?\s*(\d+)\s*(?:marks|points)', lower)
    if marks_match:
        total_marks = int(marks_match.group(1))
        
    # Extract Instructions
    instructions = "Created via Python Faculty AI Agent."
    instr_match = re.search(r'(?:instructions|description)\s+(?:are|is|be)?\s*(.+)', text, re.IGNORECASE)
    if instr_match:
        instructions = instr_match.group(1).strip()
        
    # Save to MongoDB via pymongo
    assignment_doc = {
        "title": title,
        "subject": subject,
        "department": user.get("department", "Computer Science"),
        "faculty": ObjectId(user["id"]) if isinstance(user.get("id"), str) and len(user["id"]) == 24 else user.get("id"),
        "dueDate": due_date.isoformat() + "Z",
        "totalMarks": total_marks,
        "instructions": instructions,
        "submissions": [],
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    
    db.assignments.insert_one(assignment_doc)
    
    formatted_date = due_date.strftime("%A, %B %d, %Y")
    
    reply = (
        f"🤖 **Faculty Agent (Python)**: I have successfully created and uploaded the assignment.\n\n"
        f"*   **Title**: {title}\n"
        f"*   **Course**: {subject}\n"
        f"*   **Due Date**: {formatted_date}\n"
        f"*   **Total Marks**: {total_marks}\n"
        f"*   **Instructions**: {instructions}\n\n"
        f"Students in the **{user.get('department', 'Engineering')}** department can now view this assignment on their dashboards."
    )
    
    return {
        "success": True,
        "actionTaken": "CREATE_ASSIGNMENT",
        "reply": reply
    }
