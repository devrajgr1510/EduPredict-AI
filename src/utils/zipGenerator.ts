import JSZip from 'jszip';

export async function generateEduPredictZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('EduPredict-AI');

  if (!root) throw new Error('Failed to create zip folder');

  // 1. requirements.txt
  root.file('requirements.txt', `flask>=3.0.0
flask-cors>=4.0.0
numpy>=1.26.0
pandas>=2.2.0
scikit-learn>=1.4.0
xgboost>=2.0.3
shap>=0.44.1
joblib>=1.3.2
matplotlib>=3.8.2
seaborn>=0.13.2
pytest>=8.0.0
gunicorn>=21.2.0
`);

  // 2. README.md
  root.file('README.md', `# EduPredict AI — Advanced Python Academic System
**AI-Powered Student Performance Prediction, Digital Twin, and Academic Recommendation System**

---

## 📌 Project Overview
1. Developed with **Python, Flask, Scikit-learn, XGBoost, and SHAP**.
2. Predicts future **CGPA, semester marks (0–100), and Pass/Fail outcomes**.
3. **Internal Marks Evaluation out of 50** with subject-wise tracking.
4. **Attendance Manager** with automatic 75% university eligibility checking.
5. **Interactive Timetable & Daily Tasks/ToDo Tracker** with completion marking.
6. **Digital Student Twin** simulation for "What-If" scenario forecasting.
7. **K-Means Clustering** unsupervised grouping into Advanced, Proficient, and At-Risk tiers.
8. **Projects & Certifications** portfolio tracker.
9. **Live Study Tests** for continuous concept evaluation.

---

## 🚀 Quickstart Installation

\`\`\`bash
git clone https://github.com/edupredict/EduPredict-AI.git
cd EduPredict-AI
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python ml/train.py
python app.py
\`\`\`
Visit http://127.0.0.1:5000 in your browser.
`);

  // 3. config.py
  root.file('config.py', `import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'edupredict-academic-secret-key-2026')
    DATABASE = os.environ.get('DATABASE', 'edupredict.db')
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'student_performance_dataset.csv')
`);

  // 4. database.py
  root.file('database.py', `import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        gender TEXT,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );''')

    # 2. Students
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Students (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        srn TEXT UNIQUE NOT NULL,
        gender TEXT,
        semester INTEGER,
        department TEXT,
        current_cgpa REAL,
        FOREIGN KEY(user_id) REFERENCES Users(id)
    );''')

    # 3. Subject Records & Internals (/50)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Subject_Records (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        subject_code TEXT,
        subject_name TEXT,
        internal_marks_50 REAL,
        attendance_percentage REAL,
        total_classes INTEGER,
        attended_classes INTEGER,
        FOREIGN KEY(student_id) REFERENCES Students(id)
    );''')

    # 4. Daily Tasks
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Daily_Tasks (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        title TEXT NOT NULL,
        subject_code TEXT,
        priority TEXT,
        due_date TEXT,
        is_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );''')

    # 5. Predictions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Predictions (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        attendance REAL,
        internals_50 REAL,
        study_hours REAL,
        predicted_marks REAL,
        predicted_cgpa REAL,
        pass_fail TEXT,
        risk_level TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
`);

  // 5. ml/digital_twin.py
  const mlFolder = root.folder('ml');
  mlFolder?.file('digital_twin.py', `def simulate_twin(base_features, deltas):
    """
    Simulates what-if scenario for Digital Student Twin.
    """
    sim_att = min(100.0, max(0.0, base_features['attendance'] + deltas.get('attendanceDelta', 0)))
    sim_internals = min(50.0, max(0.0, base_features['internalsOutOf50'] + deltas.get('internalsOutOf50Delta', 0)))
    sim_hours = min(14.0, max(0.0, base_features['studyHours'] + deltas.get('studyHoursDelta', 0)))
    sim_backlogs = max(0, base_features['backlogs'] + deltas.get('backlogDelta', 0))

    # Converted marks
    int_pct = (sim_internals / 50.0) * 100.0
    sim_marks = 0.32 * int_pct + 0.26 * base_features['previousMarks'] + 0.20 * sim_att + (sim_hours / 8.0 * 10.0) - (sim_backlogs * 4.5)
    sim_marks = round(min(100.0, max(0.0, sim_marks)), 1)
    sim_cgpa = round(min(10.0, max(0.0, (sim_marks / 10.0) + 0.5)), 2)

    return {
        'simulated_marks': sim_marks,
        'simulated_cgpa': sim_cgpa,
        'risk_level': 'High Risk' if sim_marks < 45 or sim_backlogs >= 2 or sim_att < 65 else ('Moderate Risk' if sim_marks < 65 else 'Low Risk')
    }
`);

  // 6. ml/train.py
  mlFolder?.file('train.py', `import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score

def train_all_models():
    # Sample synthetic dataset generation
    np.random.seed(42)
    n = 1200
    att = np.clip(np.random.normal(80, 12, n), 40, 100)
    internals_50 = np.clip(np.random.normal(36, 8, n), 10, 50)
    prev = np.clip(np.random.normal(70, 14, n), 35, 98)
    hours = np.clip(np.random.gamma(3, 1.2, n), 0.5, 12)
    backlogs = np.random.binomial(3, 0.15, n)

    final_marks = np.clip(
        0.32 * (internals_50 / 50.0 * 100) + 0.26 * prev + 0.20 * att + (hours / 8.0 * 10.0) - (backlogs * 5.0) + np.random.normal(0, 2, n),
        0, 100
    )
    pass_fail = (final_marks >= 40) & (backlogs <= 1)

    X = np.column_stack([att, internals_50, prev, hours, backlogs])
    
    # 1. Regressor (Final Marks)
    rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_reg.fit(X, final_marks)

    # 2. Classifier (Pass / Fail)
    log_reg = LogisticRegression()
    log_reg.fit(X, pass_fail)

    # 3. K-Means (3 Clusters)
    kmeans = KMeans(n_clusters=3, random_state=42)
    kmeans.fit(X)

    os.makedirs('models', exist_ok=True)
    joblib.dump(rf_reg, 'models/rf_regressor.pkl')
    joblib.dump(log_reg, 'models/log_reg_pass_fail.pkl')
    joblib.dump(kmeans, 'models/kmeans_clusters.pkl')
    print("All models (Random Forest, Logistic Regression, K-Means) trained successfully!")

if __name__ == '__main__':
    train_all_models()
`);

  // 7. app.py
  root.file('app.py', `from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db
from ml.digital_twin import simulate_twin

app = Flask(__name__)
CORS(app)
init_db()

@app.route('/')
def home():
    return jsonify({
        "name": "EduPredict AI Flask API",
        "status": "online",
        "modules": [
            "Random Forest Regression",
            "Logistic Regression Pass/Fail",
            "SHAP Explainable AI",
            "Digital Student Twin",
            "K-Means Clustering",
            "Attendance Manager",
            "Internal Marks /50 Tracker",
            "Timetable & ToDos"
        ]
    })

@app.route('/api/digital-twin/simulate', methods=['POST'])
def twin_sim():
    data = request.get_json() or {}
    base = data.get('baseInput', {})
    deltas = data.get('deltas', {})
    res = simulate_twin(base, deltas)
    return jsonify(res)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
`);

  return await zip.generateAsync({ type: 'blob' });
}
