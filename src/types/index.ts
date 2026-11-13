export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: 'male' | 'female';
  srn?: string;
  department?: string;
  semester?: number;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface SubjectDetails {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarksOutOf50: number; // User requested: internal marks for 50
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  attendedHours?: number;
  totalHours?: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  predictedMarks: number; // 0 - 100
  marks?: number;
  predictedGrade: string;
  grade?: string;
  facultyName: string;
  room: string;
}

export interface DailyTask {
  id: string;
  studentId?: string;
  title: string;
  description?: string;
  subjectCode?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  isCompleted: boolean;
  completed?: boolean;
  completedAt?: string;
}

export interface TimeTableSlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:00 AM"
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface ProjectRecord {
  id: string;
  studentId?: string;
  title: string;
  description: string;
  techStack?: string[];
  technologies?: string[];
  status?: 'Completed' | 'In Progress';
  completionDate?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  liveUrl?: string;
  grade?: string;
}

export interface CertificationRecord {
  id: string;
  studentId?: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  certificateUrl?: string;
  verificationUrl?: string;
  skillTags?: string[];
  badgeIcon?: string;
}

export interface LiveTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LiveTest {
  id: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: LiveTestQuestion[];
  completed?: boolean;
  userScore?: number; // e.g. 4/5
  lastAttemptedAt?: string;
}

export interface StudentAcademicRecord {
  id: string;
  studentId: string;
  srn: string;
  studentName: string;
  name?: string;
  gender: 'male' | 'female';
  avatarUrl: string;
  semester: number;
  currentCGPA: number;
  predictedCGPA: number;
  attendancePercentage: number;
  attendance?: number;
  previousSemesterMarks: number;
  internalAssessmentMarks: number; // 0 - 50 scale average
  internalAssessmentMarksOutOf50?: number;
  internalsOutOf50?: number;
  studyHoursPerDay: number;
  studyHours?: number;
  assignmentCompletionPercentage: number;
  backlogs: number;
  classParticipationPercentage: number;
  subjectPerformance: SubjectDetails[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  dailyTasks: DailyTask[];
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  careerGoal?: string;
  bio?: string;
  department?: string;
  finalMarks?: number;
  marks?: number;
  riskLevel?: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  performanceStatus?: 'Lagging' | 'On Track' | 'Ahead' | 'Completed';
  lastUpdated: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
  actionTab?: string;
}

export interface PredictionInput {
  attendancePercentage: number;
  previousSemesterMarks: number;
  internalAssessmentMarksOutOf50: number; // 0 - 50
  internalAssessmentMarks?: number; // fallback compatibility
  studyHoursPerDay: number;
  assignmentCompletionPercentage: number;
  backlogs: number;
  classParticipationPercentage: number;
  subjectScoreAvg?: number;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: number;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  studentId?: string;
  studentName?: string;
  srn?: string;
  inputs: PredictionInput;
  predictedMarks: number; // 0 - 100
  predictedCGPA: number;  // 0 - 10.0 scale
  predictedGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passFailResult: 'PASS' | 'FAIL';
  passProbability: number; // 0 - 100%
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  confidenceScore: number;
  confidenceRange: {
    min: number;
    max: number;
  };
  shapContributions: FeatureContribution[];
  recommendations: AcademicRecommendation[];
}

export interface AcademicRecommendation {
  id: string;
  category: 'Attendance' | 'Study Habits' | 'Internal Marks' | 'Assignments' | 'Backlog Clearance' | 'Advanced Electives';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpactMarks: number;
}

export interface DigitalStudentTwinSimulation {
  baseline: {
    attendance: number;
    internalsOutOf50: number;
    studyHours: number;
    backlogs: number;
    predictedMarks: number;
    predictedCGPA: number;
    riskLevel: string;
  };
  simulated: {
    attendance: number;
    internalsOutOf50: number;
    studyHours: number;
    backlogs: number;
    predictedMarks: number;
    predictedCGPA: number;
    riskLevel: string;
    marksDelta: number;
    cgpaDelta: number;
  };
  scenarioInsights: string[];
}

export interface KMeansClusterData {
  clusterId: number;
  label: string;
  description: string;
  badgeColor: string;
  studentCount: number;
  percentage: number;
  centroid: {
    attendance: number;
    internalMarksOutOf50: number;
    studyHours: number;
    overallScore: number;
  };
  students: {
    id: string;
    name: string;
    srn: string;
    gender: 'male' | 'female';
    avatarUrl: string;
    status: 'Lagging' | 'On Track' | 'Ahead' | 'Completed';
    marks: number;
    attendance: number;
    riskLevel: string;
  }[];
}

export interface ModelMetrics {
  regression: {
    mae: number;
    rmse: number;
    r2Score: number;
    meanActual: number;
    meanPredicted: number;
  };
  classification: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: {
      labels: string[];
      matrix: number[][];
    };
  };
  featureImportances: {
    feature: string;
    label: string;
    importancePercentage: number;
  }[];
  totalTrainingRecords: number;
  lastTrainedAt: string;
  status: 'Ready' | 'Training' | 'Evaluating';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}
