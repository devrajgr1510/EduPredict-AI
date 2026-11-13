"""Unit & Integration tests for the Python Main Backend (SQLite + ML Engine + HTTP Server)."""

from __future__ import annotations

import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

from python_app.database import AVATARS, Database
from python_app.ml_engine import (
    compute_kmeans_clusters,
    predict_student_marks,
    run_prediction,
    simulate_digital_student_twin,
)
from python_app.server import run_server


class TestPythonMLEngine(unittest.TestCase):
    def test_prediction_scales_with_internals_and_attendance(self):
        strong = run_prediction(
            {
                "attendancePercentage": 92,
                "previousSemesterMarks": 86,
                "internalAssessmentMarksOutOf50": 46,
                "studyHoursPerDay": 5.0,
                "assignmentCompletionPercentage": 96,
                "backlogs": 0,
                "classParticipationPercentage": 90,
            }
        )
        weak = run_prediction(
            {
                "attendancePercentage": 58,
                "previousSemesterMarks": 48,
                "internalAssessmentMarksOutOf50": 20,
                "studyHoursPerDay": 1.0,
                "assignmentCompletionPercentage": 45,
                "backlogs": 3,
                "classParticipationPercentage": 35,
            }
        )
        self.assertGreater(strong["predictedMarks"], 80.0)
        self.assertEqual(strong["riskLevel"], "Low Risk")
        self.assertEqual(strong["passFailResult"], "PASS")
        self.assertLess(weak["predictedMarks"], 50.0)
        self.assertEqual(weak["riskLevel"], "High Risk")
        self.assertTrue(len(weak["recommendations"]) >= 2)

    def test_digital_twin_improvement(self):
        sim = simulate_digital_student_twin(
            {
                "attendancePercentage": 68,
                "previousSemesterMarks": 64,
                "internalAssessmentMarksOutOf50": 28,
                "studyHoursPerDay": 2.0,
                "backlogs": 1,
            },
            {
                "attendance": 88,
                "internalsOutOf50": 42,
                "studyHours": 4.5,
                "backlogs": 0,
            },
        )
        self.assertGreater(sim["simulated"]["marksDelta"], 5.0)
        self.assertGreater(sim["simulated"]["cgpaDelta"], 0.5)
        self.assertEqual(sim["simulated"]["riskLevel"], "Low Risk")

    def test_kmeans_clusters_assign_all_students(self):
        cohort = [
            {"id": "1", "name": "Topper", "attendancePercentage": 95, "internalAssessmentMarks": 47, "studyHoursPerDay": 5.2, "finalMarks": 91, "backlogs": 0},
            {"id": "2", "name": "Middle", "attendancePercentage": 79, "internalAssessmentMarks": 36, "studyHoursPerDay": 3.2, "finalMarks": 72, "backlogs": 0},
            {"id": "3", "name": "Risk", "attendancePercentage": 58, "internalAssessmentMarks": 21, "studyHoursPerDay": 1.0, "finalMarks": 44, "backlogs": 3},
        ]
        clusters = compute_kmeans_clusters(cohort)
        self.assertEqual(len(clusters), 3)
        total = sum(c["studentCount"] for c in clusters)
        self.assertEqual(total, 3)


class TestPythonDatabaseAndHTTP(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self._tmp.close()
        self.db_path = self._tmp.name
        self.server = run_server(host="127.0.0.1", port=0, db_path=self.db_path)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def _req(self, method: str, path: str, payload: dict | None = None):
        url = f"http://127.0.0.1:{self.port}{path}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Content-Type": "application/json"} if payload is not None else {}
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))

    def test_health_and_students(self):
        status, health = self._req("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(health["database"], "sqlite3")
        self.assertGreaterEqual(health["students"], 8)

        status, students_res = self._req("GET", "/api/students")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(students_res["total"], 8)

    def test_attendance_internals_subjects_and_profile_persistence(self):
        # 1. Mark attendance
        status, res = self._req(
            "POST",
            "/api/students/usr-student-1/attendance",
            {"subjectCode": "CS601", "status": "present"},
        )
        self.assertEqual(status, 200)
        cs601 = next(s for s in res["student"]["subjectPerformance"] if s["subjectCode"] == "CS601")
        self.assertEqual(cs601["totalClasses"], 33)
        self.assertEqual(cs601["attendedClasses"], 30)

        # 2. Update internal marks /50
        status, res = self._req(
            "PUT",
            "/api/students/usr-student-1/internals",
            {"subjectCode": "CS602", "internalMarksOutOf50": 48},
        )
        self.assertEqual(status, 200)
        cs602 = next(s for s in res["student"]["subjectPerformance"] if s["subjectCode"] == "CS602")
        self.assertEqual(cs602["internalMarksOutOf50"], 48)

        # 3. Add and remove subject
        status, res = self._req(
            "POST",
            "/api/students/usr-student-1/subjects",
            {"subjectCode": "CS699", "subjectName": "Quantum Computing", "credits": 3, "internalMarksOutOf50": 43},
        )
        self.assertEqual(status, 201)
        codes = [s["subjectCode"] for s in res["student"]["subjectPerformance"]]
        self.assertIn("CS699", codes)

        status, res = self._req("DELETE", "/api/students/usr-student-1/subjects/CS699")
        self.assertEqual(status, 200)
        codes_after = [s["subjectCode"] for s in res["student"]["subjectPerformance"]]
        self.assertNotIn("CS699", codes_after)

        # 4. Update student gender -> male avatar synced in SQLite
        status, res = self._req(
            "PUT",
            "/api/students/usr-student-1/profile",
            {"studentName": "Arjun Patel", "gender": "male"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(res["student"]["studentName"], "Arjun Patel")
        self.assertEqual(res["student"]["avatarUrl"], AVATARS["men"]["wongLee"])

    def test_timetable_tasks_and_live_tests(self):
        status, slot = self._req(
            "POST",
            "/api/timetable",
            {
                "dayOfWeek": "Tuesday",
                "startTime": "02:00 PM",
                "endTime": "03:00 PM",
                "subjectCode": "CS610",
                "subjectName": "NLP Seminar",
                "room": "Hall 101",
                "instructor": "Prof. Rao",
                "type": "Tutorial",
            },
        )
        self.assertEqual(status, 201)
        _, tt = self._req("GET", "/api/timetable")
        self.assertTrue(any(s["subjectCode"] == "CS610" for s in tt))

        status, task = self._req(
            "POST",
            "/api/tasks",
            {"studentId": "usr-student-1", "title": "Complete Python SQLite lab", "subjectCode": "CS602", "priority": "high"},
        )
        self.assertEqual(status, 201)
        self.assertFalse(task["isCompleted"])

        status, toggled = self._req("PUT", f"/api/tasks/{task['id']}/toggle", {})
        self.assertEqual(status, 200)
        self.assertTrue(toggled["isCompleted"])

        status, generated = self._req("POST", "/api/live-tests/generate", {"studentId": "usr-student-1"})
        self.assertEqual(status, 201)
        self.assertEqual(len(generated["questions"]), 4)

        status, submitted = self._req(
            "POST",
            f"/api/live-tests/{generated['id']}/submit",
            {"answers": [0, 0, 0, 0]},
        )
        self.assertEqual(status, 200)
        self.assertEqual(submitted["score"], 4)


if __name__ == "__main__":
    unittest.main()
