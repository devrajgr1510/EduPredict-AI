"""SQLite persistence layer for LearningMate Academic Platform (Pure Python stdlib)."""

from __future__ import annotations

import json
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from python_app.ml_engine import calculate_evaluation_metrics, run_prediction


AVATARS = {
    "men": {
        "maxStem": "/src/assets/images/avatar_male_student_max_1794449957569.jpg",
        "wongLee": "/src/assets/images/avatar_male_student_wong_1794449958557.jpg",
        "orvilleNilo": "/src/assets/images/avatar_male_student_max_1794449957569.jpg",
        "nateHems": "/src/assets/images/avatar_male_student_wong_1794449958557.jpg",
        "michealSykse": "/src/assets/images/avatar_professor_rao_1793977640301.jpg",
    },
    "women": {
        "sarahPatel": "/src/assets/images/avatar_student_sarah_1793977638044.jpg",
        "emmaGarfield": "/src/assets/images/avatar_female_student_emma_1794449959684.jpg",
        "claraGarcia": "/src/assets/images/avatar_female_student_clara_1794449960604.jpg",
        "sarahNancy": "/src/assets/images/avatar_female_student_emma_1794449959684.jpg",
        "ananyaSharma": "/src/assets/images/avatar_female_student_clara_1794449960604.jpg",
    },
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class Database:
    """Thread-safe SQLite database repository for users, students, subjects, tasks, timetable, tests, and logs."""

    def __init__(self, db_path: Optional[str] = None) -> None:
        default_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.db_path = db_path or os.environ.get(
            "LEARNINGMATE_DB_PATH", os.path.join(default_dir, "learningmate.db")
        )
        if self.db_path != ":memory:":
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON;")
        self._init_schema()
        self._seed_if_empty()

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    def _init_schema(self) -> None:
        with self._lock:
            cur = self._conn.cursor()
            cur.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT NOT NULL,
                    gender TEXT DEFAULT 'female',
                    srn TEXT,
                    department TEXT,
                    semester INTEGER,
                    avatar_url TEXT,
                    phone TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS students (
                    id TEXT PRIMARY KEY,
                    student_id TEXT UNIQUE NOT NULL,
                    srn TEXT NOT NULL,
                    student_name TEXT NOT NULL,
                    gender TEXT NOT NULL DEFAULT 'female',
                    avatar_url TEXT NOT NULL,
                    semester INTEGER NOT NULL DEFAULT 6,
                    current_cgpa REAL NOT NULL DEFAULT 8.0,
                    predicted_cgpa REAL NOT NULL DEFAULT 8.2,
                    attendance_percentage REAL NOT NULL DEFAULT 85,
                    previous_semester_marks REAL NOT NULL DEFAULT 78,
                    internal_assessment_marks REAL NOT NULL DEFAULT 40,
                    study_hours_per_day REAL NOT NULL DEFAULT 3.5,
                    assignment_completion_percentage REAL NOT NULL DEFAULT 88,
                    backlogs INTEGER NOT NULL DEFAULT 0,
                    class_participation_percentage REAL NOT NULL DEFAULT 80,
                    final_marks REAL NOT NULL DEFAULT 78.0,
                    risk_level TEXT NOT NULL DEFAULT 'Low Risk',
                    performance_status TEXT NOT NULL DEFAULT 'On Track',
                    dob TEXT,
                    blood_group TEXT,
                    phone TEXT,
                    address TEXT,
                    guardian_name TEXT,
                    guardian_phone TEXT,
                    career_goal TEXT,
                    bio TEXT,
                    department TEXT,
                    last_updated TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id TEXT NOT NULL,
                    subject_code TEXT NOT NULL,
                    subject_name TEXT NOT NULL,
                    credits INTEGER NOT NULL DEFAULT 4,
                    internal_marks_50 REAL NOT NULL DEFAULT 38,
                    attendance_percentage REAL NOT NULL DEFAULT 85,
                    total_classes INTEGER NOT NULL DEFAULT 30,
                    attended_classes INTEGER NOT NULL DEFAULT 26,
                    assignments_completed INTEGER NOT NULL DEFAULT 4,
                    total_assignments INTEGER NOT NULL DEFAULT 5,
                    predicted_marks REAL NOT NULL DEFAULT 80,
                    predicted_grade TEXT NOT NULL DEFAULT 'A',
                    faculty_name TEXT NOT NULL DEFAULT 'Faculty Advisor',
                    room TEXT NOT NULL DEFAULT 'Hall 302',
                    UNIQUE(student_id, subject_code)
                );

                CREATE TABLE IF NOT EXISTS daily_tasks (
                    id TEXT PRIMARY KEY,
                    student_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    subject_code TEXT DEFAULT 'General',
                    priority TEXT NOT NULL DEFAULT 'medium',
                    due_date TEXT NOT NULL DEFAULT 'Today',
                    is_completed INTEGER NOT NULL DEFAULT 0,
                    completed_at TEXT
                );

                CREATE TABLE IF NOT EXISTS timetable_slots (
                    id TEXT PRIMARY KEY,
                    day_of_week TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    subject_code TEXT NOT NULL,
                    subject_name TEXT NOT NULL,
                    room TEXT NOT NULL,
                    instructor TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'Lecture'
                );

                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    student_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    tech_stack_json TEXT NOT NULL DEFAULT '[]',
                    status TEXT NOT NULL DEFAULT 'Completed',
                    completion_date TEXT,
                    github_url TEXT,
                    live_demo_url TEXT,
                    grade TEXT
                );

                CREATE TABLE IF NOT EXISTS certifications (
                    id TEXT PRIMARY KEY,
                    student_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    issuer TEXT NOT NULL,
                    issue_date TEXT NOT NULL,
                    credential_id TEXT,
                    certificate_url TEXT,
                    skill_tags_json TEXT NOT NULL DEFAULT '[]'
                );

                CREATE TABLE IF NOT EXISTS live_tests (
                    id TEXT PRIMARY KEY,
                    subject_code TEXT NOT NULL,
                    subject_name TEXT NOT NULL,
                    title TEXT NOT NULL,
                    duration_minutes INTEGER NOT NULL DEFAULT 10,
                    total_questions INTEGER NOT NULL,
                    questions_json TEXT NOT NULL,
                    completed INTEGER NOT NULL DEFAULT 0,
                    user_score INTEGER,
                    last_attempted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    read INTEGER NOT NULL DEFAULT 0,
                    type TEXT NOT NULL DEFAULT 'info',
                    action_tab TEXT
                );

                CREATE TABLE IF NOT EXISTS system_logs (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    action TEXT NOT NULL,
                    user_email TEXT NOT NULL,
                    details TEXT NOT NULL,
                    severity TEXT NOT NULL DEFAULT 'info'
                );

                CREATE TABLE IF NOT EXISTS model_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    metrics_json TEXT NOT NULL
                );
                """
            )
            self._conn.commit()

    def _seed_if_empty(self) -> None:
        with self._lock:
            row = self._conn.execute("SELECT COUNT(*) AS cnt FROM users").fetchone()
            if row and row["cnt"] > 0:
                return

            cur = self._conn.cursor()

            # 1. Seed Users
            users = [
                ("usr-student-1", "Sarah Patel", "sarah.patel@edupredict.edu", "student", "female", "CS2022-084", "Computer Science & Engineering", 6, AVATARS["women"]["sarahPatel"], "+1 (555) 234-8901", "2025-08-15T09:00:00Z"),
                ("usr-teacher-1", "Micheal Sykse", "micheal.sykse@edupredict.edu", "teacher", "male", None, "Computer Science & Engineering", None, AVATARS["men"]["michealSykse"], "+1 (555) 345-6789", "2024-06-10T08:30:00Z"),
                ("usr-admin-1", "Dr. Ananya Sharma", "admin@edupredict.edu", "admin", "female", None, "Dean of Academic Computing", None, AVATARS["women"]["ananyaSharma"], "+1 (555) 456-7890", "2024-01-05T07:15:00Z"),
            ]
            cur.executemany(
                "INSERT INTO users (id, name, email, role, gender, srn, department, semester, avatar_url, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                users,
            )

            # 2. Seed Students
            students = [
                ("rec-1", "usr-student-1", "CS2022-084", "Sarah Patel", "female", AVATARS["women"]["sarahPatel"], 6, 8.64, 8.85, 88, 82, 44, 4.5, 94, 0, 85, 86.4, "Low Risk", "Ahead", "2004-06-18", "B+", "+1 (555) 234-8901", "422 University Crescent, Cambridge, MA", "Dr. Ramesh Patel", "+1 (555) 890-1234", "AI Research Scientist & Distributed Systems Architect", "Passionate about deep learning algorithms, explainable models, and scalable microservices architectures.", "Computer Science & Engineering", "2026-03-01T10:00:00Z"),
                ("rec-2", "usr-student-2", "CS2022-005", "Max Stem", "male", AVATARS["men"]["maxStem"], 6, 5.8, 5.6, 64, 52, 24, 1.5, 58, 2, 42, 51.2, "High Risk", "Lagging", "2004-03-11", "O+", "+1 (555) 211-3344", "18 Oakridge Ave, Cambridge, MA", "Robert Stem", "+1 (555) 211-9900", "Full-Stack Developer", "Focusing on strengthening algorithmic problem solving and consistent lab attendance.", "Computer Science & Engineering", "2026-03-02T11:00:00Z"),
                ("rec-3", "usr-student-3", "CS2022-019", "Orville Nilo", "male", AVATARS["men"]["orvilleNilo"], 6, 7.2, 7.4, 79, 71, 36, 3.2, 82, 0, 74, 72.5, "Low Risk", "On Track", "2004-09-22", "A+", "+1 (555) 312-4455", "910 Elm Park, Cambridge, MA", "David Nilo", "+1 (555) 312-8877", "Cloud Infrastructure Engineer", "Building cloud-native APIs and automated deployment workflows.", "Computer Science & Engineering", "2026-03-02T12:00:00Z"),
                ("rec-4", "usr-student-4", "CS2022-031", "Emma Garfield", "female", AVATARS["women"]["emmaGarfield"], 6, 9.1, 9.3, 95, 89, 47, 5.2, 98, 0, 92, 91.8, "Low Risk", "Ahead", "2004-01-14", "AB+", "+1 (555) 412-6677", "55 Beacon St, Boston, MA", "Claire Garfield", "+1 (555) 412-1122", "Quantitative Systems Researcher", "Researching distributed storage systems and formal verification.", "Computer Science & Engineering", "2026-03-03T10:00:00Z"),
                ("rec-5", "usr-student-5", "CS2022-044", "Nate Hems", "male", AVATARS["men"]["nateHems"], 6, 8.4, 8.5, 86, 80, 42, 4.0, 90, 0, 84, 83.2, "Low Risk", "Completed", "2004-07-08", "B-", "+1 (555) 512-7788", "77 Riverview Rd, Cambridge, MA", "Arthur Hems", "+1 (555) 512-3344", "Security & Cryptography Analyst", "Interested in applied cryptography and zero-trust network engineering.", "Computer Science & Engineering", "2026-03-03T11:30:00Z"),
                ("rec-6", "usr-student-6", "CS2022-052", "Wong Lee", "male", AVATARS["men"]["wongLee"], 6, 4.9, 4.8, 58, 46, 21, 1.0, 45, 3, 35, 44.0, "High Risk", "Lagging", "2004-04-29", "A-", "+1 (555) 612-8899", "240 Maple St, Somerville, MA", "Chen Lee", "+1 (555) 612-0011", "Software Engineer", "Working with faculty advisors to improve attendance and clear pending backlogs.", "Computer Science & Engineering", "2026-03-04T09:00:00Z"),
                ("rec-7", "usr-student-7", "CS2022-067", "Sarah Nancy", "female", AVATARS["women"]["sarahNancy"], 6, 5.4, 5.5, 62, 50, 26, 1.8, 60, 2, 45, 52.5, "High Risk", "Lagging", "2004-11-03", "O-", "+1 (555) 712-9900", "12 Harvard Sq, Cambridge, MA", "Linda Nancy", "+1 (555) 712-4433", "Data Visualization Specialist", "Enrolled in structured peer study circles to build core exam mastery.", "Computer Science & Engineering", "2026-03-04T10:15:00Z"),
                ("rec-8", "usr-student-8", "CS2022-073", "Clara Garcia", "female", AVATARS["women"]["claraGarcia"], 6, 9.3, 9.5, 96, 91, 48, 5.5, 100, 0, 95, 94.2, "Low Risk", "Ahead", "2004-02-20", "B+", "+1 (555) 812-1100", "304 Commonwealth Ave, Boston, MA", "Elena Garcia", "+1 (555) 812-5566", "Machine Learning Systems Architect", "Top-ranking academic scholar focusing on compiler optimization and parallel ML.", "Computer Science & Engineering", "2026-03-04T11:45:00Z"),
            ]
            cur.executemany(
                """
                INSERT INTO students (
                    id, student_id, srn, student_name, gender, avatar_url, semester,
                    current_cgpa, predicted_cgpa, attendance_percentage, previous_semester_marks,
                    internal_assessment_marks, study_hours_per_day, assignment_completion_percentage,
                    backlogs, class_participation_percentage, final_marks, risk_level,
                    performance_status, dob, blood_group, phone, address, guardian_name,
                    guardian_phone, career_goal, bio, department, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                students,
            )

            # 3. Seed Subjects for Sarah Patel (usr-student-1)
            subjects = [
                ("usr-student-1", "CS601", "Machine Learning & Neural Networks", 4, 45, 91, 32, 29, 5, 5, 88, "A+", "Prof. Micheal Sykse", "Hall 302"),
                ("usr-student-1", "CS602", "Distributed Cloud Systems", 4, 42, 87, 30, 26, 4, 4, 84, "A", "Dr. Ramesh Kumar", "Hall 305"),
                ("usr-student-1", "CS603", "Software Architecture & Design", 3, 44, 89, 28, 25, 4, 4, 86, "A", "Prof. Clara Garcia", "Hall 204"),
                ("usr-student-1", "CS604", "Compiler Design", 4, 41, 84, 32, 27, 4, 4, 81, "A", "Dr. Vikramaditya", "Hall 201"),
                ("usr-student-1", "CS605", "Information Security & Cryptography", 3, 46, 92, 26, 24, 3, 3, 89, "A+", "Dr. Ananya Sharma", "Hall 302"),
            ]
            cur.executemany(
                """
                INSERT INTO subjects (
                    student_id, subject_code, subject_name, credits, internal_marks_50,
                    attendance_percentage, total_classes, attended_classes, assignments_completed,
                    total_assignments, predicted_marks, predicted_grade, faculty_name, room
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                subjects,
            )

            # 4. Seed Daily Tasks
            tasks = [
                ("task-1", "usr-student-1", "Review Machine Learning Unit 3 notes on Random Forest", None, "CS601", "high", "Today", 1, "2026-03-05T08:30:00Z"),
                ("task-2", "usr-student-1", "Complete Distributed Systems Raft consensus simulation code", None, "CS602", "high", "Tomorrow", 1, "2026-03-05T14:15:00Z"),
                ("task-3", "usr-student-1", "Solve 5 Compiler Design syntax tree parsing derivations", None, "CS604", "medium", "In 2 days", 0, None),
                ("task-4", "usr-student-1", "Submit Cryptography RSA key exchange laboratory report", None, "CS605", "high", "Friday", 0, None),
            ]
            cur.executemany(
                "INSERT INTO daily_tasks (id, student_id, title, description, subject_code, priority, due_date, is_completed, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tasks,
            )

            # 5. Seed Timetable
            tt = [
                ("tt-1", "Monday", "09:00 AM", "10:00 AM", "CS601", "Machine Learning & Neural Networks", "Hall 302", "Prof. Micheal Sykse", "Lecture"),
                ("tt-2", "Monday", "10:15 AM", "11:15 AM", "CS602", "Distributed Cloud Systems", "Hall 305", "Dr. Ramesh Kumar", "Lecture"),
                ("tt-3", "Monday", "11:30 AM", "01:00 PM", "CS601L", "AI & Machine Learning Lab", "Computing Lab 4", "Prof. Micheal Sykse", "Lab"),
                ("tt-4", "Tuesday", "09:00 AM", "10:00 AM", "CS603", "Software Architecture & Design", "Hall 204", "Prof. Clara Garcia", "Lecture"),
                ("tt-5", "Tuesday", "10:15 AM", "11:15 AM", "CS604", "Compiler Design", "Hall 201", "Dr. Vikramaditya", "Lecture"),
                ("tt-6", "Wednesday", "09:00 AM", "10:00 AM", "CS605", "Information Security & Cryptography", "Hall 302", "Dr. Ananya Sharma", "Lecture"),
                ("tt-7", "Wednesday", "10:15 AM", "11:15 AM", "CS601", "Machine Learning & Neural Networks", "Hall 302", "Prof. Micheal Sykse", "Lecture"),
                ("tt-8", "Thursday", "09:00 AM", "10:00 AM", "CS602", "Distributed Cloud Systems", "Hall 305", "Dr. Ramesh Kumar", "Lecture"),
                ("tt-9", "Thursday", "10:15 AM", "12:15 PM", "CS605L", "Security & Pen-testing Lab", "Network Lab 2", "Dr. Ananya Sharma", "Lab"),
                ("tt-10", "Friday", "09:00 AM", "10:00 AM", "CS604", "Compiler Design", "Hall 201", "Dr. Vikramaditya", "Tutorial"),
                ("tt-11", "Friday", "10:15 AM", "11:15 AM", "CS603", "Software Architecture & Design", "Hall 204", "Prof. Clara Garcia", "Lecture"),
            ]
            cur.executemany(
                "INSERT INTO timetable_slots (id, day_of_week, start_time, end_time, subject_code, subject_name, room, instructor, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tt,
            )

            # 6. Seed Projects
            projects = [
                ("proj-1", "usr-student-1", "Distributed Log Consensus Cluster", "Fault-tolerant distributed log replication implementing Raft leader election with heartbeat monitoring.", json.dumps(["Python", "gRPC", "Docker", "Distributed Systems"]), "Completed", "January 2026", "https://github.com/sarah-patel/raft-cluster", None, "A+"),
                ("proj-2", "usr-student-1", "Compiler Semantic Analyzer & Type Checker", "Abstract syntax tree verifier with static type inference written cleanly in Python.", json.dumps(["Python", "PLY", "Compilers", "Unit Testing"]), "Completed", "March 2026", "https://github.com/sarah-patel/ast-typechecker", None, "A"),
            ]
            cur.executemany(
                "INSERT INTO projects (id, student_id, title, description, tech_stack_json, status, completion_date, github_url, live_demo_url, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                projects,
            )

            # 7. Seed Certifications
            certs = [
                ("cert-1", "usr-student-1", "AWS Certified Machine Learning – Specialty", "Amazon Web Services", "December 2025", "AWS-MLS-89021", None, json.dumps(["Machine Learning", "SageMaker", "Cloud Data Pipelines"])),
                ("cert-2", "usr-student-1", "Deep Learning Specialization", "DeepLearning.AI / Coursera", "October 2025", "DL-SPEC-44129", None, json.dumps(["Neural Networks", "PyTorch", "Computer Vision"])),
            ]
            cur.executemany(
                "INSERT INTO certifications (id, student_id, title, issuer, issue_date, credential_id, certificate_url, skill_tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                certs,
            )

            # 8. Seed Live Tests
            tests = [
                (
                    "test-ml-1",
                    "CS601",
                    "Machine Learning & Neural Networks",
                    "Unit 3: Decision Trees & Ensemble Learning",
                    10,
                    4,
                    json.dumps(
                        [
                            {
                                "id": "q1",
                                "question": "Which impurity metric is primarily minimized when splitting categorical features in classification decision trees?",
                                "options": ["Gini Impurity", "Mean Squared Error", "Euclidean Distance", "R-Squared Score"],
                                "correctIndex": 0,
                                "explanation": "Gini impurity measures the probability of misclassifying a randomly chosen element from the set.",
                            },
                            {
                                "id": "q2",
                                "question": "What technique helps decorrelate individual decision trees and reduce variance overfitting?",
                                "options": ["Gradient Descent", "Bootstrap Aggregation (Bagging) & Random Feature Subsets", "L1 Lasso Regularization", "PCA"],
                                "correctIndex": 1,
                                "explanation": "Bagging trains each tree on a bootstrap sample with random feature subsets at each split.",
                            },
                            {
                                "id": "q3",
                                "question": "Which metric best measures regression prediction error in the same unit as exam marks (0-100)?",
                                "options": ["Mean Absolute Error (MAE)", "Log Loss", "Precision", "ROC-AUC"],
                                "correctIndex": 0,
                                "explanation": "MAE reports average absolute error directly in marks units.",
                            },
                            {
                                "id": "q4",
                                "question": "Which method prevents data leakage during academic performance evaluation?",
                                "options": ["Normalizing before train-test split", "Fitting scalers strictly on the training partition", "Testing on training rows", "Using full-dataset mean imputation"],
                                "correctIndex": 1,
                                "explanation": "Preprocessing statistics must be learned strictly on the training partition.",
                            },
                        ]
                    ),
                    1,
                    4,
                    "2026-03-04T17:30:00Z",
                ),
                (
                    "test-cloud-1",
                    "CS602",
                    "Distributed Cloud Systems",
                    "Unit 2: Consensus & CAP Theorem in Cloud Clusters",
                    10,
                    3,
                    json.dumps(
                        [
                            {
                                "id": "q1",
                                "question": "According to the CAP theorem, which property must a distributed system trade off during a network partition?",
                                "options": ["Either Consistency or Availability", "Throughput or Latency", "Storage or Bandwidth", "Security or Encryption"],
                                "correctIndex": 0,
                                "explanation": "During a partition, a store selects Consistency (reject writes) or Availability (allow potentially stale reads).",
                            },
                            {
                                "id": "q2",
                                "question": "What is the role of the Raft consensus algorithm in distributed state machines?",
                                "options": ["Data compression", "Electing a leader and replicating log entries consistently across nodes", "CSS rendering", "SQL syntax lexing"],
                                "correctIndex": 1,
                                "explanation": "Raft coordinates leader election and deterministic log replication across cluster replicas.",
                            },
                            {
                                "id": "q3",
                                "question": "Which architectural pattern best decouples microservice message streams?",
                                "options": ["Monolithic Shared Memory", "Event-Driven Message Queues", "Synchronous Blocking RPC", "Manual File Copies"],
                                "correctIndex": 1,
                                "explanation": "Asynchronous event queues provide resilience and backpressure isolation.",
                            },
                        ]
                    ),
                    0,
                    None,
                    None,
                ),
            ]
            cur.executemany(
                "INSERT INTO live_tests (id, subject_code, subject_name, title, duration_minutes, total_questions, questions_json, completed, user_score, last_attempted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tests,
            )

            # 9. Seed Notifications
            notifs = [
                ("notif-1", "Attendance Safety Alert", "Compiler Design (CS604) attendance is 84% (27/32 classes). You can miss at most 4 more hours to stay safely above 75%.", "10 mins ago", 0, "warning", "attendance"),
                ("notif-2", "Internal Assessment Recorded", "Continuous Internal Assessment for Distributed Cloud Systems (CS602) was entered as 42/50.", "2 hours ago", 0, "info", "subjects"),
                ("notif-3", "Practice Assessment Ready", "Diagnostic test for Decision Trees & Ensembles is ready based on your enrolled courses.", "Yesterday", 0, "info", "tests"),
                ("notif-4", "Timetable Schedule Confirmed", "Computing Lab session on Monday morning is confirmed in Computing Lab 4.", "2 days ago", 1, "success", "timetable"),
            ]
            cur.executemany(
                "INSERT INTO notifications (id, title, message, timestamp, read, type, action_tab) VALUES (?, ?, ?, ?, ?, ?, ?)",
                notifs,
            )

            # 10. Seed System Logs
            logs = [
                ("log-1", "2026-03-05T09:12:00Z", "Digital Student Twin Simulated", "sarah.patel@edupredict.edu", "Simulated +10% attendance and +5 marks in internal exams; projected +4.8% final marks boost.", "info"),
                ("log-2", "2026-03-05T08:45:00Z", "Cohort Clustering Executed", "micheal.sykse@edupredict.edu", "Python clustering partitioned cohort across Excelling, On Track, and Lagging tiers.", "info"),
                ("log-3", "2026-03-04T17:30:00Z", "Live Test Completed", "sarah.patel@edupredict.edu", "Completed Unit 3 Live Assessment with 4/4 score (100%).", "info"),
            ]
            cur.executemany(
                "INSERT INTO system_logs (id, timestamp, action, user_email, details, severity) VALUES (?, ?, ?, ?, ?, ?)",
                logs,
            )

            # 11. Seed Model Metrics
            metrics = {
                "regression": {"mae": 2.34, "rmse": 3.12, "r2Score": 0.918, "meanActual": 68.7, "meanPredicted": 68.4},
                "classification": {
                    "accuracy": 94.2,
                    "precision": 93.8,
                    "recall": 94.6,
                    "f1Score": 94.2,
                    "confusionMatrix": {"labels": ["Low Risk", "Moderate Risk", "High Risk"], "matrix": [[142, 6, 1], [5, 84, 4], [0, 3, 55]]},
                },
                "featureImportances": [
                    {"feature": "attendancePercentage", "label": "Attendance Percentage", "importancePercentage": 27.5},
                    {"feature": "internalAssessmentMarksOutOf50", "label": "Internal Marks (/50)", "importancePercentage": 25.4},
                    {"feature": "previousSemesterMarks", "label": "Previous Semester Marks", "importancePercentage": 20.6},
                    {"feature": "studyHoursPerDay", "label": "Daily Study Hours", "importancePercentage": 13.4},
                    {"feature": "backlogs", "label": "Active Backlogs", "importancePercentage": 7.6},
                    {"feature": "assignmentCompletionPercentage", "label": "Assignment Completion", "importancePercentage": 3.8},
                    {"feature": "classParticipationPercentage", "label": "Class Participation", "importancePercentage": 1.7},
                ],
                "totalTrainingRecords": 1200,
                "lastTrainedAt": "2026-03-01T04:30:00Z",
                "status": "Ready",
            }
            cur.execute(
                "INSERT INTO model_state (id, metrics_json) VALUES (1, ?)",
                (json.dumps(metrics),),
            )
            self._conn.commit()

    # ---------- Helper Row Mappers ----------

    @staticmethod
    def _row_to_user(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "role": row["role"],
            "gender": row["gender"],
            "srn": row["srn"],
            "department": row["department"],
            "semester": row["semester"],
            "avatarUrl": row["avatar_url"],
            "phone": row["phone"],
            "createdAt": row["created_at"],
        }

    @staticmethod
    def _row_to_subject(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "subjectCode": row["subject_code"],
            "subjectName": row["subject_name"],
            "credits": row["credits"],
            "internalMarksOutOf50": row["internal_marks_50"],
            "attendancePercentage": row["attendance_percentage"],
            "totalClasses": row["total_classes"],
            "attendedClasses": row["attended_classes"],
            "attendedHours": row["attended_classes"],
            "totalHours": row["total_classes"],
            "assignmentsCompleted": row["assignments_completed"],
            "totalAssignments": row["total_assignments"],
            "predictedMarks": row["predicted_marks"],
            "predictedGrade": row["predicted_grade"],
            "facultyName": row["faculty_name"],
            "room": row["room"],
        }

    @staticmethod
    def _row_to_task(row: sqlite3.Row) -> Dict[str, Any]:
        done = bool(row["is_completed"])
        return {
            "id": row["id"],
            "studentId": row["student_id"],
            "title": row["title"],
            "description": row["description"],
            "subjectCode": row["subject_code"],
            "priority": row["priority"],
            "dueDate": row["due_date"],
            "isCompleted": done,
            "completed": done,
            "completedAt": row["completed_at"],
        }

    @staticmethod
    def _row_to_project(row: sqlite3.Row) -> Dict[str, Any]:
        techs = json.loads(row["tech_stack_json"] or "[]")
        return {
            "id": row["id"],
            "studentId": row["student_id"],
            "title": row["title"],
            "description": row["description"],
            "techStack": techs,
            "technologies": techs,
            "status": row["status"],
            "completionDate": row["completion_date"],
            "githubUrl": row["github_url"],
            "liveDemoUrl": row["live_demo_url"],
            "liveUrl": row["live_demo_url"],
            "grade": row["grade"],
        }

    @staticmethod
    def _row_to_cert(row: sqlite3.Row) -> Dict[str, Any]:
        tags = json.loads(row["skill_tags_json"] or "[]")
        return {
            "id": row["id"],
            "studentId": row["student_id"],
            "title": row["title"],
            "issuer": row["issuer"],
            "issueDate": row["issue_date"],
            "credentialId": row["credential_id"],
            "certificateUrl": row["certificate_url"],
            "skillTags": tags,
        }

    def _hydrate_student(self, row: sqlite3.Row) -> Dict[str, Any]:
        sid = row["student_id"]
        subjs = [
            self._row_to_subject(r)
            for r in self._conn.execute(
                "SELECT * FROM subjects WHERE student_id = ? ORDER BY id ASC", (sid,)
            ).fetchall()
        ]
        tasks = [
            self._row_to_task(r)
            for r in self._conn.execute(
                "SELECT * FROM daily_tasks WHERE student_id = ? ORDER BY rowid DESC", (sid,)
            ).fetchall()
        ]
        projs = [
            self._row_to_project(r)
            for r in self._conn.execute(
                "SELECT * FROM projects WHERE student_id = ? ORDER BY rowid DESC", (sid,)
            ).fetchall()
        ]
        certs = [
            self._row_to_cert(r)
            for r in self._conn.execute(
                "SELECT * FROM certifications WHERE student_id = ? ORDER BY rowid DESC", (sid,)
            ).fetchall()
        ]
        return {
            "id": row["id"],
            "studentId": row["student_id"],
            "srn": row["srn"],
            "studentName": row["student_name"],
            "name": row["student_name"],
            "gender": row["gender"],
            "avatarUrl": row["avatar_url"],
            "semester": row["semester"],
            "currentCGPA": row["current_cgpa"],
            "predictedCGPA": row["predicted_cgpa"],
            "attendancePercentage": row["attendance_percentage"],
            "previousSemesterMarks": row["previous_semester_marks"],
            "internalAssessmentMarks": row["internal_assessment_marks"],
            "studyHoursPerDay": row["study_hours_per_day"],
            "assignmentCompletionPercentage": row["assignment_completion_percentage"],
            "backlogs": row["backlogs"],
            "classParticipationPercentage": row["class_participation_percentage"],
            "finalMarks": row["final_marks"],
            "riskLevel": row["risk_level"],
            "performanceStatus": row["performance_status"],
            "dob": row["dob"],
            "bloodGroup": row["blood_group"],
            "phone": row["phone"],
            "address": row["address"],
            "guardianName": row["guardian_name"],
            "guardianPhone": row["guardian_phone"],
            "careerGoal": row["career_goal"],
            "bio": row["bio"],
            "department": row["department"],
            "lastUpdated": row["last_updated"],
            "subjectPerformance": subjs,
            "dailyTasks": tasks,
            "projects": projs,
            "certifications": certs,
        }

    # ---------- Auth Operations ----------

    def list_users(self) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
            return [self._row_to_user(r) for r in rows]

    def login_user(self, email: str, role: str = "student") -> Dict[str, Any]:
        with self._lock:
            row = self._conn.execute(
                "SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,)
            ).fetchone()
            if row:
                return self._row_to_user(row)

            # Auto-provision user in SQLite if signing in cleanly
            uid = f"usr-{uuid.uuid4().hex[:7]}"
            local_name = email.split("@")[0].replace(".", " ").title()
            lower_email = email.lower()
            gender = (
                "female"
                if any(k in lower_email for k in ("sarah", "emma", "clara", "ananya"))
                else "male"
            )
            avatar = (
                AVATARS["women"]["sarahPatel"]
                if gender == "female"
                else AVATARS["men"]["wongLee"]
            )
            srn = f"CS2022-{uuid.uuid4().int % 899 + 100}" if role == "student" else None
            sem = 6 if role == "student" else None
            now = _now_iso()

            self._conn.execute(
                "INSERT INTO users (id, name, email, role, gender, srn, department, semester, avatar_url, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (uid, local_name, email, role, gender, srn, "Computer Science & Engineering", sem, avatar, "+1 (555) 200-0001", now),
            )
            if role == "student":
                self._provision_default_student_record(uid, local_name, gender, avatar, srn or "CS2022-999", sem or 6)
            self._conn.commit()
            created = self._conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
            return self._row_to_user(created)

    def register_user(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip()
        role = payload.get("role") or "student"
        if not name or not email:
            raise ValueError("Name and email are required")

        with self._lock:
            existing = self._conn.execute(
                "SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email,)
            ).fetchone()
            if existing:
                raise KeyError("A user with this email already exists")

            gender = payload.get("gender") or (
                "female"
                if any(k in name.lower() for k in ("sarah", "emma", "clara", "ananya"))
                else "male"
            )
            avatar = (
                AVATARS["women"]["sarahPatel"]
                if gender == "female"
                else AVATARS["men"]["maxStem"]
            )
            uid = f"usr-{uuid.uuid4().hex[:7]}"
            srn = payload.get("srn") or (
                f"CS2022-{uuid.uuid4().int % 899 + 100}" if role == "student" else None
            )
            sem = int(payload.get("semester") or 6) if role == "student" else None
            dept = payload.get("department") or "Computer Science & Engineering"
            now = _now_iso()

            self._conn.execute(
                "INSERT INTO users (id, name, email, role, gender, srn, department, semester, avatar_url, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (uid, name, email, role, gender, srn, dept, sem, avatar, "+1 (555) 234-9900", now),
            )
            if role == "student":
                self._provision_default_student_record(uid, name, gender, avatar, srn or "CS2022-999", sem or 6, dept)
            self.add_log("New User Registered", email, f"Registered {role}: {name}", "info")
            self._conn.commit()
            created = self._conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
            return self._row_to_user(created)

    def _provision_default_student_record(
        self,
        student_id: str,
        name: str,
        gender: str,
        avatar_url: str,
        srn: str,
        semester: int,
        department: str = "Computer Science & Engineering",
    ) -> None:
        rec_id = f"rec-{uuid.uuid4().hex[:7]}"
        now = _now_iso()
        self._conn.execute(
            """
            INSERT INTO students (
                id, student_id, srn, student_name, gender, avatar_url, semester,
                current_cgpa, predicted_cgpa, attendance_percentage, previous_semester_marks,
                internal_assessment_marks, study_hours_per_day, assignment_completion_percentage,
                backlogs, class_participation_percentage, final_marks, risk_level,
                performance_status, department, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (rec_id, student_id, srn, name, gender, avatar_url, semester, 7.8, 8.0, 82, 74, 38, 3.5, 85, 0, 75, 76.5, "Low Risk", "On Track", department, now),
        )
        self._conn.executemany(
            """
            INSERT INTO subjects (
                student_id, subject_code, subject_name, credits, internal_marks_50,
                attendance_percentage, total_classes, attended_classes, assignments_completed,
                total_assignments, predicted_marks, predicted_grade, faculty_name, room
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (student_id, "CS601", "Machine Learning & Neural Networks", 4, 38, 85, 32, 27, 4, 5, 78, "A", "Prof. Micheal Sykse", "Hall 302"),
                (student_id, "CS602", "Distributed Cloud Systems", 4, 36, 80, 30, 24, 3, 4, 74, "B", "Dr. Ramesh Kumar", "Hall 305"),
            ],
        )

    def get_current_user(self, email: Optional[str] = None) -> Dict[str, Any]:
        with self._lock:
            if email:
                row = self._conn.execute(
                    "SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,)
                ).fetchone()
                if row:
                    return self._row_to_user(row)
            row = self._conn.execute("SELECT * FROM users ORDER BY rowid ASC LIMIT 1").fetchone()
            return self._row_to_user(row)

    # ---------- Student & Bio-Data Operations ----------

    def list_students(
        self,
        search: Optional[str] = None,
        risk_level: Optional[str] = None,
        semester: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM students ORDER BY rowid ASC").fetchall()
            hydrated = [self._hydrate_student(r) for r in rows]
            if search:
                q = search.lower()
                hydrated = [
                    s
                    for s in hydrated
                    if q in s["studentName"].lower() or q in s["srn"].lower()
                ]
            if risk_level and risk_level != "all":
                hydrated = [s for s in hydrated if s["riskLevel"] == risk_level]
            if semester and semester != "all":
                sem_num = int(semester)
                hydrated = [s for s in hydrated if s["semester"] == sem_num]
            return hydrated

    def _find_student_row(self, identifier: str) -> Optional[sqlite3.Row]:
        return self._conn.execute(
            "SELECT * FROM students WHERE id = ? OR student_id = ? OR srn = ?",
            (identifier, identifier, identifier),
        ).fetchone()

    def get_student(self, identifier: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            return self._hydrate_student(row) if row else None

    def update_student_profile(
        self, identifier: str, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            if not row:
                return None

            gender = payload.get("gender", row["gender"])
            avatar_url = payload.get("avatarUrl")
            if not avatar_url:
                avatar_url = (
                    AVATARS["men"]["wongLee"]
                    if gender == "male"
                    else AVATARS["women"]["sarahPatel"]
                )

            name = payload.get("studentName", payload.get("name", row["student_name"]))
            srn = payload.get("srn", row["srn"])
            dept = payload.get("department", row["department"])
            sem = int(payload.get("semester", row["semester"]))
            now = _now_iso()

            self._conn.execute(
                """
                UPDATE students SET
                    student_name = ?, gender = ?, avatar_url = ?, srn = ?, department = ?,
                    semester = ?, dob = ?, blood_group = ?, phone = ?, address = ?,
                    guardian_name = ?, guardian_phone = ?, career_goal = ?, bio = ?,
                    last_updated = ?
                WHERE id = ?
                """,
                (
                    name,
                    gender,
                    avatar_url,
                    srn,
                    dept,
                    sem,
                    payload.get("dob", row["dob"]),
                    payload.get("bloodGroup", row["blood_group"]),
                    payload.get("phone", row["phone"]),
                    payload.get("address", row["address"]),
                    payload.get("guardianName", row["guardian_name"]),
                    payload.get("guardianPhone", row["guardian_phone"]),
                    payload.get("careerGoal", row["career_goal"]),
                    payload.get("bio", row["bio"]),
                    now,
                    row["id"],
                ),
            )
            self._conn.execute(
                "UPDATE users SET name = ?, gender = ?, avatar_url = ?, srn = ?, department = ?, semester = ?, phone = ? WHERE id = ?",
                (name, gender, avatar_url, srn, dept, sem, payload.get("phone", row["phone"]), row["student_id"]),
            )
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM students WHERE id = ?", (row["id"],)).fetchone()
            return self._hydrate_student(updated)

    def _recompute_student_aggregates(self, student_id: str) -> None:
        subjs = self._conn.execute(
            "SELECT * FROM subjects WHERE student_id = ?", (student_id,)
        ).fetchall()
        if not subjs:
            return
        total_attended = sum(r["attended_classes"] for r in subjs)
        total_classes = sum(r["total_classes"] for r in subjs)
        att_pct = (
            round((total_attended / total_classes) * 100)
            if total_classes > 0
            else round(sum(r["attendance_percentage"] for r in subjs) / len(subjs))
        )
        avg_int_50 = round(sum(r["internal_marks_50"] for r in subjs) / len(subjs))

        row = self._conn.execute(
            "SELECT * FROM students WHERE student_id = ?", (student_id,)
        ).fetchone()
        if row:
            pred = run_prediction(
                {
                    "attendancePercentage": att_pct,
                    "previousSemesterMarks": row["previous_semester_marks"],
                    "internalAssessmentMarksOutOf50": avg_int_50,
                    "studyHoursPerDay": row["study_hours_per_day"],
                    "assignmentCompletionPercentage": row["assignment_completion_percentage"],
                    "backlogs": row["backlogs"],
                    "classParticipationPercentage": row["class_participation_percentage"],
                }
            )
            self._conn.execute(
                """
                UPDATE students SET
                    attendance_percentage = ?,
                    internal_assessment_marks = ?,
                    predicted_cgpa = ?,
                    final_marks = ?,
                    risk_level = ?,
                    last_updated = ?
                WHERE student_id = ?
                """,
                (
                    att_pct,
                    avg_int_50,
                    pred["predictedCGPA"],
                    pred["predictedMarks"],
                    pred["riskLevel"],
                    _now_iso(),
                    student_id,
                ),
            )

    def add_attendance(
        self, identifier: str, subject_code: str, status: str
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            if not row:
                return None
            sid = row["student_id"]
            subj = self._conn.execute(
                "SELECT * FROM subjects WHERE student_id = ? AND subject_code = ?",
                (sid, subject_code),
            ).fetchone()
            if subj:
                new_total = int(subj["total_classes"]) + 1
                new_attended = int(subj["attended_classes"]) + (1 if status == "present" else 0)
                new_pct = round((new_attended / new_total) * 100)
                self._conn.execute(
                    "UPDATE subjects SET total_classes = ?, attended_classes = ?, attendance_percentage = ? WHERE id = ?",
                    (new_total, new_attended, new_pct, subj["id"]),
                )
                self._recompute_student_aggregates(sid)
                self._conn.commit()
            updated = self._conn.execute("SELECT * FROM students WHERE id = ?", (row["id"],)).fetchone()
            return self._hydrate_student(updated)

    def update_internal_marks(
        self, identifier: str, subject_code: str, marks_50: float
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            if not row:
                return None
            sid = row["student_id"]
            clamped = max(0.0, min(50.0, float(marks_50)))
            marks_100 = round((clamped / 50.0) * 100)
            if marks_100 >= 90:
                grade = "A+"
            elif marks_100 >= 80:
                grade = "A"
            elif marks_100 >= 70:
                grade = "B"
            elif marks_100 >= 60:
                grade = "C"
            elif marks_100 >= 50:
                grade = "D"
            else:
                grade = "F"

            self._conn.execute(
                "UPDATE subjects SET internal_marks_50 = ?, predicted_marks = ?, predicted_grade = ? WHERE student_id = ? AND subject_code = ?",
                (clamped, marks_100, grade, sid, subject_code),
            )
            self._recompute_student_aggregates(sid)
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM students WHERE id = ?", (row["id"],)).fetchone()
            return self._hydrate_student(updated)

    def add_subject(
        self, identifier: str, subject: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            if not row:
                return None
            sid = row["student_id"]
            total_cls = int(subject.get("totalClasses") or 30)
            att_cls = int(subject.get("attendedClasses") or 27)
            att_pct = int(
                subject.get("attendancePercentage")
                or round((att_cls / max(1, total_cls)) * 100)
            )
            int_50 = float(subject.get("internalMarksOutOf50") or 40)
            pred_marks = float(subject.get("predictedMarks") or round((int_50 / 50.0) * 100))
            grade = subject.get("predictedGrade") or ("A" if pred_marks >= 80 else "B")

            self._conn.execute(
                """
                INSERT OR REPLACE INTO subjects (
                    student_id, subject_code, subject_name, credits, internal_marks_50,
                    attendance_percentage, total_classes, attended_classes, assignments_completed,
                    total_assignments, predicted_marks, predicted_grade, faculty_name, room
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    sid,
                    str(subject.get("subjectCode") or "CS606").upper(),
                    subject.get("subjectName") or "Elective Course",
                    int(subject.get("credits") or 4),
                    int_50,
                    att_pct,
                    total_cls,
                    att_cls,
                    int(subject.get("assignmentsCompleted") or 3),
                    int(subject.get("totalAssignments") or 4),
                    pred_marks,
                    grade,
                    subject.get("facultyName") or "Dr. Vikramaditya",
                    subject.get("room") or "Hall 402",
                ),
            )
            self._recompute_student_aggregates(sid)
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM students WHERE id = ?", (row["id"],)).fetchone()
            return self._hydrate_student(updated)

    def remove_subject(
        self, identifier: str, subject_code: str
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._find_student_row(identifier)
            if not row:
                return None
            sid = row["student_id"]
            self._conn.execute(
                "DELETE FROM subjects WHERE student_id = ? AND subject_code = ?",
                (sid, subject_code),
            )
            self._recompute_student_aggregates(sid)
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM students WHERE id = ?", (row["id"],)).fetchone()
            return self._hydrate_student(updated)

    # ---------- Tasks Operations ----------

    def list_tasks(self, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            sid = student_id or "usr-student-1"
            rows = self._conn.execute(
                "SELECT * FROM daily_tasks WHERE student_id = ? ORDER BY rowid DESC", (sid,)
            ).fetchall()
            return [self._row_to_task(r) for r in rows]

    def create_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            tid = f"task-{uuid.uuid4().hex[:8]}"
            sid = payload.get("studentId") or "usr-student-1"
            self._conn.execute(
                "INSERT INTO daily_tasks (id, student_id, title, description, subject_code, priority, due_date, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
                (
                    tid,
                    sid,
                    payload.get("title") or "Untitled Study Task",
                    payload.get("description"),
                    payload.get("subjectCode") or "General",
                    payload.get("priority") or "medium",
                    payload.get("dueDate") or "Today",
                ),
            )
            self._conn.commit()
            row = self._conn.execute("SELECT * FROM daily_tasks WHERE id = ?", (tid,)).fetchone()
            return self._row_to_task(row)

    def toggle_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._conn.execute("SELECT * FROM daily_tasks WHERE id = ?", (task_id,)).fetchone()
            if not row:
                return None
            new_state = 0 if row["is_completed"] else 1
            completed_at = _now_iso() if new_state else None
            self._conn.execute(
                "UPDATE daily_tasks SET is_completed = ?, completed_at = ? WHERE id = ?",
                (new_state, completed_at, task_id),
            )
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM daily_tasks WHERE id = ?", (task_id,)).fetchone()
            return self._row_to_task(updated)

    def delete_task(self, task_id: str) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM daily_tasks WHERE id = ?", (task_id,))
            self._conn.commit()

    # ---------- Timetable Operations ----------

    def list_timetable(self) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM timetable_slots ORDER BY rowid ASC").fetchall()
            return [
                {
                    "id": r["id"],
                    "dayOfWeek": r["day_of_week"],
                    "startTime": r["start_time"],
                    "endTime": r["end_time"],
                    "subjectCode": r["subject_code"],
                    "subjectName": r["subject_name"],
                    "room": r["room"],
                    "instructor": r["instructor"],
                    "type": r["type"],
                }
                for r in rows
            ]

    def add_timetable_slot(self, slot: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            slot_id = slot.get("id") or f"tt-{uuid.uuid4().hex[:7]}"
            self._conn.execute(
                "INSERT INTO timetable_slots (id, day_of_week, start_time, end_time, subject_code, subject_name, room, instructor, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    slot_id,
                    slot.get("dayOfWeek") or "Monday",
                    slot.get("startTime") or "09:00 AM",
                    slot.get("endTime") or "10:00 AM",
                    slot.get("subjectCode") or "CS606",
                    slot.get("subjectName") or "Elective Lecture",
                    slot.get("room") or "Hall 301",
                    slot.get("instructor") or "Faculty Advisor",
                    slot.get("type") or "Lecture",
                ),
            )
            self._conn.commit()
            return {
                "id": slot_id,
                "dayOfWeek": slot.get("dayOfWeek") or "Monday",
                "startTime": slot.get("startTime") or "09:00 AM",
                "endTime": slot.get("endTime") or "10:00 AM",
                "subjectCode": slot.get("subjectCode") or "CS606",
                "subjectName": slot.get("subjectName") or "Elective Lecture",
                "room": slot.get("room") or "Hall 301",
                "instructor": slot.get("instructor") or "Faculty Advisor",
                "type": slot.get("type") or "Lecture",
            }

    def delete_timetable_slot(self, slot_id: str) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM timetable_slots WHERE id = ?", (slot_id,))
            self._conn.commit()

    # ---------- Projects & Certifications ----------

    def list_projects(self, student_id: str = "usr-student-1") -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM projects WHERE student_id = ? ORDER BY rowid DESC",
                (student_id,),
            ).fetchall()
            return [self._row_to_project(r) for r in rows]

    def add_project(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            pid = f"proj-{uuid.uuid4().hex[:7]}"
            sid = payload.get("studentId") or "usr-student-1"
            raw_tech = payload.get("technologies") or payload.get("techStack") or []
            if isinstance(raw_tech, str):
                techs = [t.strip() for t in raw_tech.split(",") if t.strip()]
            else:
                techs = list(raw_tech)
            self._conn.execute(
                "INSERT INTO projects (id, student_id, title, description, tech_stack_json, status, completion_date, github_url, live_demo_url, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    pid,
                    sid,
                    payload.get("title") or "Academic Project",
                    payload.get("description") or "Engineering project implementation.",
                    json.dumps(techs),
                    payload.get("status") or "Completed",
                    payload.get("completionDate") or _now_iso()[:10],
                    payload.get("githubUrl"),
                    payload.get("liveDemoUrl") or payload.get("liveUrl"),
                    payload.get("grade"),
                ),
            )
            self._conn.commit()
            row = self._conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
            return self._row_to_project(row)

    def list_certifications(self, student_id: str = "usr-student-1") -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM certifications WHERE student_id = ? ORDER BY rowid DESC",
                (student_id,),
            ).fetchall()
            return [self._row_to_cert(r) for r in rows]

    def add_certification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            cid = f"cert-{uuid.uuid4().hex[:7]}"
            sid = payload.get("studentId") or "usr-student-1"
            tags = payload.get("skillTags") or ["Verified Credential"]
            self._conn.execute(
                "INSERT INTO certifications (id, student_id, title, issuer, issue_date, credential_id, certificate_url, skill_tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    cid,
                    sid,
                    payload.get("title") or "Course Certification",
                    payload.get("issuer") or "Accredited Institute",
                    payload.get("issueDate") or "March 2026",
                    payload.get("credentialId"),
                    payload.get("certificateUrl"),
                    json.dumps(tags),
                ),
            )
            self._conn.commit()
            row = self._conn.execute("SELECT * FROM certifications WHERE id = ?", (cid,)).fetchone()
            return self._row_to_cert(row)

    # ---------- Live Tests ----------

    def _row_to_test(self, r: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "subjectCode": r["subject_code"],
            "subjectName": r["subject_name"],
            "title": r["title"],
            "durationMinutes": r["duration_minutes"],
            "totalQuestions": r["total_questions"],
            "questions": json.loads(r["questions_json"]),
            "completed": bool(r["completed"]),
            "userScore": r["user_score"],
            "lastAttemptedAt": r["last_attempted_at"],
        }

    def list_live_tests(self) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM live_tests ORDER BY rowid DESC").fetchall()
            return [self._row_to_test(r) for r in rows]

    def generate_live_test(self, student_id: str = "usr-student-1") -> Dict[str, Any]:
        with self._lock:
            subj = self._conn.execute(
                "SELECT * FROM subjects WHERE student_id = ? ORDER BY internal_marks_50 ASC LIMIT 1",
                (student_id,),
            ).fetchone()
            code = subj["subject_code"] if subj else "CS601"
            name = subj["subject_name"] if subj else "Machine Learning & Neural Networks"
            tid = f"test-py-{uuid.uuid4().hex[:7]}"
            questions = [
                {
                    "id": f"q-{tid}-1",
                    "question": f"In continuous assessment of {name}, what prevents models from high-variance overfitting?",
                    "options": ["Regularization & k-fold cross-validation", "Removing validation splits", "Multiplying learning rate by 100", "Memorizing training rows"],
                    "correctIndex": 0,
                    "explanation": "L1/L2 penalties and k-fold cross-validation verify generalization on unseen records.",
                },
                {
                    "id": f"q-{tid}-2",
                    "question": "How do internal assessment continuous marks (/50) impact semester grade point averages?",
                    "options": ["They carry direct course evaluation weight alongside finals", "They carry 0% impact", "Only practicals count", "They are non-credit"],
                    "correctIndex": 0,
                    "explanation": "Continuous internal assessments (/50) contribute substantially to overall semester grades.",
                },
                {
                    "id": f"q-{tid}-3",
                    "question": "What is the mandatory minimum attendance threshold for university exam eligibility?",
                    "options": ["75% attendance cutoff", "50% attendance", "95% attendance only", "25% attendance"],
                    "correctIndex": 0,
                    "explanation": "Institutional regulations mandate at least 75% lecture attendance for final exam registration.",
                },
                {
                    "id": f"q-{tid}-4",
                    "question": "Which study schedule best supports long-term concept retention without burnout?",
                    "options": ["Daily 45-minute spaced active recall sessions", "All-night cramming before exams", "Skipping lab work for theory", "Ignoring assignments"],
                    "correctIndex": 0,
                    "explanation": "Spaced repetition and consistent daily study sessions maximize conceptual retention.",
                },
            ]
            self._conn.execute(
                "INSERT INTO live_tests (id, subject_code, subject_name, title, duration_minutes, total_questions, questions_json, completed) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
                (tid, code, name, f"Personalized Revision Exam: {name}", 12, len(questions), json.dumps(questions)),
            )
            self._conn.commit()
            row = self._conn.execute("SELECT * FROM live_tests WHERE id = ?", (tid,)).fetchone()
            return self._row_to_test(row)

    def submit_live_test(self, test_id: str, answers: Optional[List[int]] = None, score_override: Optional[int] = None) -> Optional[Dict[str, Any]]:
        with self._lock:
            row = self._conn.execute("SELECT * FROM live_tests WHERE id = ?", (test_id,)).fetchone()
            if not row:
                return None
            questions = json.loads(row["questions_json"])
            if score_override is not None:
                score = int(score_override)
            else:
                score = 0
                ans = answers or []
                for idx, q in enumerate(questions):
                    if idx < len(ans) and ans[idx] == q["correctIndex"]:
                        score += 1
            now = _now_iso()
            self._conn.execute(
                "UPDATE live_tests SET completed = 1, user_score = ?, last_attempted_at = ? WHERE id = ?",
                (score, now, test_id),
            )
            self._conn.commit()
            updated = self._conn.execute("SELECT * FROM live_tests WHERE id = ?", (test_id,)).fetchone()
            test_obj = self._row_to_test(updated)
            total = len(questions) or 1
            return {
                "score": score,
                "total": total,
                "percentage": round((score / total) * 100),
                "test": test_obj,
            }

    # ---------- Notifications ----------

    def list_notifications(self) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM notifications ORDER BY rowid ASC").fetchall()
            return [
                {
                    "id": r["id"],
                    "title": r["title"],
                    "message": r["message"],
                    "timestamp": r["timestamp"],
                    "read": bool(r["read"]),
                    "type": r["type"],
                    "actionTab": r["action_tab"],
                }
                for r in rows
            ]

    def mark_notification_read(self, notif_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            if notif_id:
                self._conn.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notif_id,))
            else:
                self._conn.execute("UPDATE notifications SET read = 1")
            self._conn.commit()
            return self.list_notifications()

    # ---------- Logs & Model Metrics ----------

    def list_logs(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT ?", (limit,)
            ).fetchall()
            return [
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "action": r["action"],
                    "userEmail": r["user_email"],
                    "details": r["details"],
                    "severity": r["severity"],
                }
                for r in rows
            ]

    def add_log(self, action: str, user_email: str, details: str, severity: str = "info") -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO system_logs (id, timestamp, action, user_email, details, severity) VALUES (?, ?, ?, ?, ?, ?)",
                (f"log-{uuid.uuid4().hex[:7]}", _now_iso(), action, user_email, details, severity),
            )
            self._conn.commit()

    def get_model_metrics(self) -> Dict[str, Any]:
        with self._lock:
            row = self._conn.execute("SELECT metrics_json FROM model_state WHERE id = 1").fetchone()
            if row:
                return json.loads(row["metrics_json"])
            return calculate_evaluation_metrics()

    def retrain_models(self) -> Dict[str, Any]:
        with self._lock:
            students = self.list_students()
            metrics = calculate_evaluation_metrics(students)
            self._conn.execute(
                "INSERT OR REPLACE INTO model_state (id, metrics_json) VALUES (1, ?)",
                (json.dumps(metrics),),
            )
            self.add_log(
                "Python Ensemble Model Retrained",
                "admin@edupredict.edu",
                f"Retrained pure-Python ensemble across {len(students)} active student records (R2={metrics['regression']['r2Score']}).",
                "info",
            )
            self._conn.commit()
            return metrics
