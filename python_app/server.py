"""Pure-Python HTTP REST API & Static SPA Server for LearningMate."""

from __future__ import annotations

import json
import mimetypes
import os
import posixpath
import sys
import urllib.parse
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, Optional, Tuple

from python_app.ai_advisor import generate_academic_advice
from python_app.database import Database
from python_app.ml_engine import (
    compute_kmeans_clusters,
    run_prediction,
    simulate_digital_student_twin,
)


def create_handler_class(db: Database, static_dir: Optional[str] = None):
    """Build a request handler bound to a Database instance and optional dist/ folder."""

    class LearningMateHandler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, format: str, *args: Any) -> None:
            # Quiet structured request logging unless DEBUG_PYTHON_HTTP is set
            if os.environ.get("DEBUG_PYTHON_HTTP") == "1":
                sys.stderr.write(f"[python-api] {self.address_string()} - {format % args}\n")

        def _send_json(self, status: int, payload: Any) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _read_json(self) -> Dict[str, Any]:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                return {}
            raw = self.rfile.read(length)
            try:
                parsed = json.loads(raw.decode("utf-8"))
                return parsed if isinstance(parsed, dict) else {"data": parsed}
            except ValueError:
                return {}

        def _parse_url(self) -> Tuple[str, Dict[str, str]]:
            parsed = urllib.parse.urlparse(self.path)
            qs = {
                k: v[0]
                for k, v in urllib.parse.parse_qs(parsed.query, keep_blank_values=True).items()
            }
            return parsed.path.rstrip("/") or "/", qs

        # ---------- Routing ----------

        def do_GET(self) -> None:
            path, qs = self._parse_url()

            if path == "/api/health":
                students = db.list_students()
                return self._send_json(
                    HTTPStatus.OK,
                    {
                        "status": "ok",
                        "runtime": f"Python {sys.version.split()[0]}",
                        "database": "sqlite3",
                        "students": len(students),
                    },
                )

            if path == "/api/auth/me":
                user = db.get_current_user(qs.get("email"))
                return self._send_json(HTTPStatus.OK, {"user": user})

            if path == "/api/users":
                return self._send_json(HTTPStatus.OK, db.list_users())

            if path == "/api/students":
                students = db.list_students(
                    search=qs.get("search"),
                    risk_level=qs.get("riskLevel"),
                    semester=qs.get("semester"),
                )
                return self._send_json(
                    HTTPStatus.OK, {"students": students, "total": len(students)}
                )

            if path.startswith("/api/students/"):
                parts = path.split("/")
                if len(parts) == 4:
                    student = db.get_student(urllib.parse.unquote(parts[3]))
                    if not student:
                        return self._send_json(
                            HTTPStatus.NOT_FOUND, {"error": "Student record not found"}
                        )
                    return self._send_json(HTTPStatus.OK, student)

            if path == "/api/tasks":
                return self._send_json(
                    HTTPStatus.OK, db.list_tasks(qs.get("studentId"))
                )

            if path == "/api/timetable":
                return self._send_json(HTTPStatus.OK, db.list_timetable())

            if path == "/api/live-tests":
                return self._send_json(HTTPStatus.OK, db.list_live_tests())

            if path == "/api/projects":
                return self._send_json(
                    HTTPStatus.OK, db.list_projects(qs.get("studentId") or "usr-student-1")
                )

            if path == "/api/certifications":
                return self._send_json(
                    HTTPStatus.OK,
                    db.list_certifications(qs.get("studentId") or "usr-student-1"),
                )

            if path == "/api/notifications":
                return self._send_json(HTTPStatus.OK, db.list_notifications())

            if path == "/api/clusters":
                students = db.list_students()
                return self._send_json(HTTPStatus.OK, compute_kmeans_clusters(students))

            if path == "/api/model-metrics":
                return self._send_json(HTTPStatus.OK, db.get_model_metrics())

            if path == "/api/system-logs":
                limit = int(qs.get("limit") or 20)
                return self._send_json(HTTPStatus.OK, db.list_logs(limit))

            if path.startswith("/api/"):
                return self._send_json(
                    HTTPStatus.NOT_FOUND, {"error": f"Unknown endpoint: {path}"}
                )

            # Serve built SPA static assets if static_dir is configured
            self._serve_static(path)

        def do_POST(self) -> None:
            path, _qs = self._parse_url()
            body = self._read_json()

            if path == "/api/auth/login":
                email = (body.get("email") or "").strip()
                if not email:
                    return self._send_json(
                        HTTPStatus.BAD_REQUEST, {"error": "Email is required"}
                    )
                role = body.get("role") or "student"
                user = db.login_user(email, role)
                return self._send_json(
                    HTTPStatus.OK,
                    {
                        "user": user,
                        "token": f"py-token-{user['id']}",
                    },
                )

            if path == "/api/auth/register":
                try:
                    user = db.register_user(body)
                except ValueError as err:
                    return self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(err)})
                except KeyError as err:
                    return self._send_json(HTTPStatus.CONFLICT, {"error": str(err)})
                return self._send_json(
                    HTTPStatus.CREATED,
                    {
                        "user": user,
                        "token": f"py-token-{user['id']}",
                    },
                )

            if path.startswith("/api/students/") and path.endswith("/attendance"):
                sid = urllib.parse.unquote(path.split("/")[3])
                subj_code = body.get("subjectCode") or ""
                status = body.get("status") or "present"
                student = db.add_attendance(sid, subj_code, status)
                if not student:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Student not found"}
                    )
                return self._send_json(HTTPStatus.OK, {"success": True, "student": student})

            if path.startswith("/api/students/") and path.endswith("/subjects"):
                sid = urllib.parse.unquote(path.split("/")[3])
                student = db.add_subject(sid, body)
                if not student:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Student not found"}
                    )
                return self._send_json(HTTPStatus.CREATED, {"success": True, "student": student})

            if path == "/api/tasks":
                task = db.create_task(body)
                return self._send_json(HTTPStatus.CREATED, task)

            if path == "/api/timetable":
                slot = db.add_timetable_slot(body)
                return self._send_json(HTTPStatus.CREATED, slot)

            if path == "/api/live-tests/generate":
                test = db.generate_live_test(body.get("studentId") or "usr-student-1")
                return self._send_json(HTTPStatus.CREATED, test)

            if path.startswith("/api/live-tests/") and path.endswith("/submit"):
                test_id = urllib.parse.unquote(path.split("/")[3])
                result = db.submit_live_test(
                    test_id,
                    answers=body.get("answers"),
                    score_override=body.get("score"),
                )
                if not result:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Test not found"}
                    )
                return self._send_json(HTTPStatus.OK, result)

            if path == "/api/projects":
                proj = db.add_project(body)
                return self._send_json(HTTPStatus.CREATED, proj)

            if path == "/api/certifications":
                cert = db.add_certification(body)
                return self._send_json(HTTPStatus.CREATED, cert)

            if path == "/api/digital-twin/simulate":
                base_input = body.get("baseInput") or body
                deltas = body.get("deltas") or {}
                return self._send_json(
                    HTTPStatus.OK, simulate_digital_student_twin(base_input, deltas)
                )

            if path == "/api/predict":
                pred_input = body.get("input") or body
                if "attendancePercentage" not in pred_input:
                    return self._send_json(
                        HTTPStatus.BAD_REQUEST,
                        {"error": "Attendance percentage is required"},
                    )
                result = run_prediction(
                    pred_input,
                    student_name=body.get("studentName"),
                    srn=body.get("srn"),
                )
                if body.get("studentId"):
                    result["studentId"] = body["studentId"]
                return self._send_json(HTTPStatus.OK, result)

            if path == "/api/models/retrain":
                metrics = db.retrain_models()
                return self._send_json(
                    HTTPStatus.OK,
                    {
                        "success": True,
                        "message": "Python ensemble model retrained successfully",
                        "metrics": metrics,
                    },
                )

            if path == "/api/ai-chat":
                message = (body.get("message") or "").strip()
                if not message:
                    return self._send_json(
                        HTTPStatus.BAD_REQUEST, {"error": "Message required"}
                    )
                reply = generate_academic_advice(message, body.get("context"))
                return self._send_json(HTTPStatus.OK, {"reply": reply})

            return self._send_json(
                HTTPStatus.NOT_FOUND, {"error": f"Unknown endpoint: {path}"}
            )

        def do_PUT(self) -> None:
            path, _qs = self._parse_url()
            body = self._read_json()

            if path.startswith("/api/students/") and path.endswith("/internals"):
                sid = urllib.parse.unquote(path.split("/")[3])
                student = db.update_internal_marks(
                    sid,
                    body.get("subjectCode") or "",
                    float(body.get("internalMarksOutOf50") or 0),
                )
                if not student:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Student not found"}
                    )
                return self._send_json(HTTPStatus.OK, {"success": True, "student": student})

            if path.startswith("/api/students/") and path.endswith("/profile"):
                sid = urllib.parse.unquote(path.split("/")[3])
                student = db.update_student_profile(sid, body)
                if not student:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Student not found"}
                    )
                return self._send_json(HTTPStatus.OK, {"success": True, "student": student})

            if path.startswith("/api/tasks/") and path.endswith("/toggle"):
                task_id = urllib.parse.unquote(path.split("/")[3])
                task = db.toggle_task(task_id)
                if not task:
                    return self._send_json(
                        HTTPStatus.NOT_FOUND, {"error": "Task not found"}
                    )
                return self._send_json(HTTPStatus.OK, task)

            if path == "/api/notifications/read-all":
                notifs = db.mark_notification_read(None)
                return self._send_json(HTTPStatus.OK, notifs)

            if path.startswith("/api/notifications/") and path.endswith("/read"):
                nid = urllib.parse.unquote(path.split("/")[3])
                notifs = db.mark_notification_read(nid)
                return self._send_json(HTTPStatus.OK, notifs)

            return self._send_json(
                HTTPStatus.NOT_FOUND, {"error": f"Unknown endpoint: {path}"}
            )

        def do_DELETE(self) -> None:
            path, _qs = self._parse_url()

            if path.startswith("/api/tasks/"):
                task_id = urllib.parse.unquote(path.split("/")[3])
                db.delete_task(task_id)
                return self._send_json(HTTPStatus.OK, {"success": True})

            if path.startswith("/api/timetable/"):
                slot_id = urllib.parse.unquote(path.split("/")[3])
                db.delete_timetable_slot(slot_id)
                return self._send_json(HTTPStatus.OK, {"success": True})

            if path.startswith("/api/students/") and "/subjects/" in path:
                parts = path.split("/")
                if len(parts) >= 6:
                    sid = urllib.parse.unquote(parts[3])
                    code = urllib.parse.unquote(parts[5])
                    student = db.remove_subject(sid, code)
                    if not student:
                        return self._send_json(
                            HTTPStatus.NOT_FOUND, {"error": "Student not found"}
                        )
                    return self._send_json(
                        HTTPStatus.OK, {"success": True, "student": student}
                    )

            return self._send_json(
                HTTPStatus.NOT_FOUND, {"error": f"Unknown endpoint: {path}"}
            )

        def _serve_static(self, req_path: str) -> None:
            if not static_dir or not os.path.isdir(static_dir):
                return self._send_json(
                    HTTPStatus.NOT_FOUND,
                    {"error": "Frontend build directory (dist/) not found"},
                )

            rel = posixpath.normpath(urllib.parse.unquote(req_path)).lstrip("/")
            if rel.startswith(".."):
                return self._send_json(HTTPStatus.FORBIDDEN, {"error": "Forbidden"})

            candidate = os.path.join(static_dir, rel) if rel else os.path.join(static_dir, "index.html")
            if not os.path.isfile(candidate):
                candidate = os.path.join(static_dir, "index.html")

            if not os.path.isfile(candidate):
                return self._send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})

            mime, _ = mimetypes.guess_type(candidate)
            with open(candidate, "rb") as f:
                data = f.read()

            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", mime or "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

    return LearningMateHandler


def run_server(
    host: str = "0.0.0.0",
    port: int = 3000,
    db_path: Optional[str] = None,
    static_dir: Optional[str] = None,
) -> ThreadingHTTPServer:
    """Create and start the Python HTTP server."""
    db = Database(db_path=db_path)
    handler_cls = create_handler_class(db, static_dir=static_dir)
    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer((host, port), handler_cls)
    return server
