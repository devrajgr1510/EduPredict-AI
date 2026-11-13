"""Python Gemini Academic Advisor client using stdlib urllib.request."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any, Dict, Optional


def generate_academic_advice(
    message: str, context: Optional[Dict[str, Any]] = None
) -> str:
    """Query Gemini 2.5 Flash via REST API when GEMINI_API_KEY is available, with empathetic fallback."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    ctx = context or {}

    if api_key and api_key != "MY_GEMINI_API_KEY":
        system_prompt = (
            "You are the Edu Predict Academic Advisor, a warm, empathetic mentor for college students. "
            f"Student Context: {json.dumps(ctx)}. "
            "Provide concise, structured, practical study advice, timetable tips, and exam strategies."
        )
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_prompt}\n\nStudent: {message}"}],
                }
            ]
        }
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.5-flash:generateContent?key={api_key}"
        )
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates") or []
                if candidates:
                    parts = (candidates[0].get("content") or {}).get("parts") or []
                    if parts and parts[0].get("text"):
                        return str(parts[0]["text"])
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
            pass

    # Context-aware fallback written by Python academic rules
    attendance = ctx.get("attendance", 85)
    internals = ctx.get("internalMarks", 40)
    study_hours = ctx.get("studyHours", 3.5)
    backlogs = ctx.get("backlogs", 0)

    advice_lines = ["Here is your personalized academic guidance:"]

    if isinstance(attendance, (int, float)) and attendance < 75:
        advice_lines.append(
            f"• Attendance Recovery Priority: At {attendance}%, aim to attend your next 10 consecutive lectures and labs to cross the 75% eligibility buffer cleanly."
        )
    else:
        advice_lines.append(
            f"• Attendance Buffer: Your {attendance}% attendance gives you strong exam eligibility—keep attending core morning labs consistently."
        )

    if isinstance(internals, (int, float)) and internals < 35:
        advice_lines.append(
            f"• Internal Assessment (/50) Focus: Lifting your {internals}/50 average to 40+/50 via tutorial submissions and quiz reviews adds strong cushion before finals."
        )
    else:
        advice_lines.append(
            f"• Internal Assessment Strength: Scoring {internals}/50 keeps you on track for an A or A+ grade. Lock in full lab viva points this week."
        )

    if isinstance(backlogs, int) and backlogs > 0:
        advice_lines.append(
            f"• Backlog Clearance: Set aside a 45-minute weekend block exclusively for previous question-paper drills across your {backlogs} carryover subject(s)."
        )
    else:
        advice_lines.append(
            f"• Daily Study Rhythm: Pair your {study_hours} hrs/day routine with 25-minute Pomodoro active-recall sprints and check off tasks in your Daily ToDo tracker."
        )

    return "\n".join(advice_lines)
