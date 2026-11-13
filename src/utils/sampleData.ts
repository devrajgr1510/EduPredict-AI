import {
  User,
  StudentAcademicRecord,
  TimeTableSlot,
  LiveTest,
  ModelMetrics,
  SystemLog,
  NotificationItem
} from '../types/index.ts';

// Separate distinct photos for men and women
export const AVATARS = {
  men: {
    maxStem: '/src/assets/images/avatar_male_student_max_1794449957569.jpg',
    wongLee: '/src/assets/images/avatar_male_student_wong_1794449958557.jpg',
    orvilleNilo: '/src/assets/images/avatar_male_student_max_1794449957569.jpg',
    nateHems: '/src/assets/images/avatar_male_student_wong_1794449958557.jpg',
    michealSykse: '/src/assets/images/avatar_professor_rao_1793977640301.jpg'
  },
  women: {
    sarahPatel: '/src/assets/images/avatar_student_sarah_1793977638044.jpg',
    emmaGarfield: '/src/assets/images/avatar_female_student_emma_1794449959684.jpg',
    claraGarcia: '/src/assets/images/avatar_female_student_clara_1794449960604.jpg',
    sarahNancy: '/src/assets/images/avatar_female_student_emma_1794449959684.jpg',
    ananyaSharma: '/src/assets/images/avatar_female_student_clara_1794449960604.jpg'
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-student-1',
    name: 'Sarah Patel',
    email: 'sarah.patel@edupredict.edu',
    role: 'student',
    gender: 'female',
    srn: 'CS2022-084',
    department: 'Computer Science & Engineering',
    semester: 6,
    avatarUrl: AVATARS.women.sarahPatel,
    phone: '+1 (555) 234-8901',
    createdAt: '2025-08-15T09:00:00Z'
  },
  {
    id: 'usr-teacher-1',
    name: 'Micheal Sykse',
    email: 'micheal.sykse@edupredict.edu',
    role: 'teacher',
    gender: 'male',
    department: 'Computer Science & Engineering',
    avatarUrl: AVATARS.men.michealSykse,
    phone: '+1 (555) 345-6789',
    createdAt: '2024-06-10T08:30:00Z'
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Ananya Sharma',
    email: 'admin@edupredict.edu',
    role: 'admin',
    gender: 'female',
    department: 'Dean of Academic Computing',
    avatarUrl: AVATARS.women.ananyaSharma,
    phone: '+1 (555) 456-7890',
    createdAt: '2024-01-05T07:15:00Z'
  }
];

export const INITIAL_TIMETABLE: TimeTableSlot[] = [
  {
    id: 'tt-1',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS601',
    subjectName: 'Machine Learning & Neural Networks',
    room: 'Hall 302',
    instructor: 'Prof. Micheal Sykse',
    type: 'Lecture'
  },
  {
    id: 'tt-2',
    dayOfWeek: 'Monday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    subjectCode: 'CS602',
    subjectName: 'Distributed Cloud Systems',
    room: 'Hall 305',
    instructor: 'Dr. Ramesh Kumar',
    type: 'Lecture'
  },
  {
    id: 'tt-3',
    dayOfWeek: 'Monday',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    subjectCode: 'CS601L',
    subjectName: 'AI & Machine Learning Lab',
    room: 'Computing Lab 4',
    instructor: 'Prof. Micheal Sykse',
    type: 'Lab'
  },
  {
    id: 'tt-4',
    dayOfWeek: 'Tuesday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS603',
    subjectName: 'Software Architecture & Design',
    room: 'Hall 204',
    instructor: 'Prof. Clara Garcia',
    type: 'Lecture'
  },
  {
    id: 'tt-5',
    dayOfWeek: 'Tuesday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    subjectCode: 'CS604',
    subjectName: 'Compiler Design',
    room: 'Hall 201',
    instructor: 'Dr. Vikramaditya',
    type: 'Lecture'
  },
  {
    id: 'tt-6',
    dayOfWeek: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS605',
    subjectName: 'Information Security & Cryptography',
    room: 'Hall 302',
    instructor: 'Dr. Ananya Sharma',
    type: 'Lecture'
  },
  {
    id: 'tt-7',
    dayOfWeek: 'Wednesday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    subjectCode: 'CS601',
    subjectName: 'Machine Learning & Neural Networks',
    room: 'Hall 302',
    instructor: 'Prof. Micheal Sykse',
    type: 'Lecture'
  },
  {
    id: 'tt-8',
    dayOfWeek: 'Thursday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS602',
    subjectName: 'Distributed Cloud Systems',
    room: 'Hall 305',
    instructor: 'Dr. Ramesh Kumar',
    type: 'Lecture'
  },
  {
    id: 'tt-9',
    dayOfWeek: 'Thursday',
    startTime: '10:15 AM',
    endTime: '12:15 PM',
    subjectCode: 'CS605L',
    subjectName: 'Security & Pen-testing Lab',
    room: 'Network Lab 2',
    instructor: 'Dr. Ananya Sharma',
    type: 'Lab'
  },
  {
    id: 'tt-10',
    dayOfWeek: 'Friday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS604',
    subjectName: 'Compiler Design',
    room: 'Hall 201',
    instructor: 'Dr. Vikramaditya',
    type: 'Tutorial'
  },
  {
    id: 'tt-11',
    dayOfWeek: 'Friday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    subjectCode: 'CS603',
    subjectName: 'Software Architecture & Design',
    room: 'Hall 204',
    instructor: 'Prof. Clara Garcia',
    type: 'Lecture'
  }
];

export const INITIAL_LIVE_TESTS: LiveTest[] = [
  {
    id: 'test-ml-1',
    subjectCode: 'CS601',
    subjectName: 'Machine Learning & Neural Networks',
    title: 'Unit 3: Decision Trees & Random Forest Ensembles',
    durationMinutes: 10,
    totalQuestions: 4,
    completed: true,
    userScore: 4,
    questions: [
      {
        id: 'q1',
        question: 'Which impurity metric is primarily minimized when splitting categorical features in classification decision trees?',
        options: ['Gini Impurity', 'Mean Squared Error', 'Euclidean Distance', 'R-Squared Score'],
        correctIndex: 0,
        explanation: 'Gini impurity measures the probability of misclassifying a randomly chosen element from the set if it were randomly labeled.'
      },
      {
        id: 'q2',
        question: 'What technique does Random Forest utilize to decorrelate individual decision trees and avoid overfitting?',
        options: ['Gradient Descent', 'Bootstrap Aggregation (Bagging) & Random Feature Subsets', 'L1 Lasso Regularization', 'Principal Component Analysis'],
        correctIndex: 1,
        explanation: 'Random Forest trains each tree on a bootstrap sample of data and only considers a random subset of features at each split.'
      },
      {
        id: 'q3',
        question: 'What do SHAP values explain in a trained machine learning model?',
        options: ['Training execution time in milliseconds', 'Fair additive contribution of each feature to a prediction compared to the base value', 'Database memory consumption', 'Hyperparameter tuning grid'],
        correctIndex: 1,
        explanation: 'SHAP (SHapley Additive exPlanations) uses cooperative game theory to quantify the exact push/pull contribution of each input feature.'
      },
      {
        id: 'q4',
        question: 'Which of the following is an effective method to handle data leakage during academic performance prediction?',
        options: ['Normalizing before train-test split', 'Fitting scalers and imputers solely on the training partition', 'Testing on the training records', 'Imputing test missing values using full-dataset mean'],
        correctIndex: 1,
        explanation: 'To prevent data leakage, preprocessing parameters must be learned strictly on the training partition without touching test sets.'
      }
    ]
  },
  {
    id: 'test-cloud-1',
    subjectCode: 'CS602',
    subjectName: 'Distributed Cloud Systems',
    title: 'Unit 2: Consensus & CAP Theorem in Cloud Clusters',
    durationMinutes: 10,
    totalQuestions: 3,
    completed: false,
    questions: [
      {
        id: 'q1',
        question: 'According to the CAP theorem, which property must a distributed system sacrifice during network partition?',
        options: ['Either Consistency or Availability', 'Throughput or Latency', 'Storage or Network Bandwidth', 'Security or Encryption'],
        correctIndex: 0,
        explanation: 'When a network partition occurs, a distributed data store must choose between Consistency (refusing writes) or Availability (returning stale reads).'
      },
      {
        id: 'q2',
        question: 'What is the role of Raft consensus algorithm in distributed state machines?',
        options: ['Data compression', 'Electing a leader and replicating log entries consistently across nodes', 'Managing CSS stylesheets', 'SQL query compilation'],
        correctIndex: 1,
        explanation: 'Raft manages replicated logs through leader election, log replication, and commitment safety.'
      },
      {
        id: 'q3',
        question: 'Which architectural pattern is best suited for decoupling microservice message streams in distributed clouds?',
        options: ['Monolithic Shared Memory', 'Event-Driven Message Queues (Kafka / PubSub)', 'Synchronous Blocking RPC', 'Direct File Uploads'],
        correctIndex: 1,
        explanation: 'Asynchronous event streaming queues decouple producers and consumers, providing high resilience and backpressure buffering.'
      }
    ]
  }
];

export const INITIAL_STUDENTS: StudentAcademicRecord[] = [
  {
    id: 'rec-1',
    studentId: 'usr-student-1',
    srn: 'CS2022-084',
    studentName: 'Sarah Patel',
    gender: 'female',
    avatarUrl: AVATARS.women.sarahPatel,
    semester: 6,
    currentCGPA: 8.64,
    predictedCGPA: 8.85,
    attendancePercentage: 88,
    previousSemesterMarks: 82,
    internalAssessmentMarks: 44, // out of 50 (88%)
    studyHoursPerDay: 4.5,
    assignmentCompletionPercentage: 94,
    backlogs: 0,
    classParticipationPercentage: 85,
    finalMarks: 86.4,
    riskLevel: 'Low Risk',
    performanceStatus: 'Ahead',
    dob: '2004-06-18',
    bloodGroup: 'B+',
    phone: '+1 (555) 234-8901',
    address: '422 University Crescent, Cambridge, MA',
    guardianName: 'Dr. Ramesh Patel',
    guardianPhone: '+1 (555) 890-1234',
    careerGoal: 'AI Research Scientist & Distributed Systems Architect',
    bio: 'Passionate about deep learning algorithms, explainable AI models, and scalable microservices architectures.',
    department: 'Computer Science & Engineering',
    lastUpdated: '2026-03-01T10:00:00Z',
    subjectPerformance: [
      {
        subjectCode: 'CS601',
        subjectName: 'Machine Learning & Neural Networks',
        credits: 4,
        internalMarksOutOf50: 45,
        attendancePercentage: 91,
        totalClasses: 32,
        attendedClasses: 29,
        assignmentsCompleted: 5,
        totalAssignments: 5,
        predictedMarks: 88,
        predictedGrade: 'A+',
        facultyName: 'Prof. Micheal Sykse',
        room: 'Hall 302'
      },
      {
        subjectCode: 'CS602',
        subjectName: 'Distributed Cloud Systems',
        credits: 4,
        internalMarksOutOf50: 42,
        attendancePercentage: 87,
        totalClasses: 30,
        attendedClasses: 26,
        assignmentsCompleted: 4,
        totalAssignments: 4,
        predictedMarks: 84,
        predictedGrade: 'A',
        facultyName: 'Dr. Ramesh Kumar',
        room: 'Hall 305'
      },
      {
        subjectCode: 'CS603',
        subjectName: 'Software Architecture & Design',
        credits: 3,
        internalMarksOutOf50: 44,
        attendancePercentage: 89,
        totalClasses: 28,
        attendedClasses: 25,
        assignmentsCompleted: 4,
        totalAssignments: 4,
        predictedMarks: 86,
        predictedGrade: 'A',
        facultyName: 'Prof. Clara Garcia',
        room: 'Hall 204'
      },
      {
        subjectCode: 'CS604',
        subjectName: 'Compiler Design',
        credits: 4,
        internalMarksOutOf50: 41,
        attendancePercentage: 84,
        totalClasses: 32,
        attendedClasses: 27,
        assignmentsCompleted: 4,
        totalAssignments: 4,
        predictedMarks: 81,
        predictedGrade: 'A',
        facultyName: 'Dr. Vikramaditya',
        room: 'Hall 201'
      },
      {
        subjectCode: 'CS605',
        subjectName: 'Information Security & Cryptography',
        credits: 3,
        internalMarksOutOf50: 46,
        attendancePercentage: 92,
        totalClasses: 26,
        attendedClasses: 24,
        assignmentsCompleted: 3,
        totalAssignments: 3,
        predictedMarks: 89,
        predictedGrade: 'A+',
        facultyName: 'Dr. Ananya Sharma',
        room: 'Hall 302'
      }
    ],
    dailyTasks: [
      {
        id: 'task-1',
        studentId: 'usr-student-1',
        title: 'Review Machine Learning Unit 3 notes on Random Forest',
        subjectCode: 'CS601',
        priority: 'high',
        dueDate: 'Today',
        isCompleted: true,
        completedAt: '2026-03-05T08:30:00Z'
      },
      {
        id: 'task-2',
        studentId: 'usr-student-1',
        title: 'Complete Distributed Systems Raft consensus simulation code',
        subjectCode: 'CS602',
        priority: 'high',
        dueDate: 'Tomorrow',
        isCompleted: true,
        completedAt: '2026-03-05T14:15:00Z'
      },
      {
        id: 'task-3',
        studentId: 'usr-student-1',
        title: 'Solve 5 Compiler Design syntax tree parsing derivations',
        subjectCode: 'CS604',
        priority: 'medium',
        dueDate: 'In 2 days',
        isCompleted: false
      },
      {
        id: 'task-4',
        studentId: 'usr-student-1',
        title: 'Submit Cryptography RSA key exchange laboratory report',
        subjectCode: 'CS605',
        priority: 'high',
        dueDate: 'Friday',
        isCompleted: false
      }
    ],
    projects: [
      {
        id: 'proj-1',
        studentId: 'usr-student-1',
        title: 'EduPredict AI: Student Performance Prediction Engine',
        description: 'End-to-end full-stack machine learning system with Random Forest, SHAP explainable AI, and Digital Student Twin.',
        techStack: ['Python', 'Flask', 'Scikit-learn', 'React', 'Tailwind CSS'],
        status: 'Completed',
        completionDate: 'March 2026',
        githubUrl: 'https://github.com/sarah-patel/edupredict-ai'
      },
      {
        id: 'proj-2',
        studentId: 'usr-student-1',
        title: 'Distributed Log Consensus Cluster',
        description: 'Fault-tolerant distributed log replication implementing Raft leader election with heartbeat monitoring.',
        techStack: ['Go', 'gRPC', 'Docker', 'Distributed Systems'],
        status: 'Completed',
        completionDate: 'January 2026',
        githubUrl: 'https://github.com/sarah-patel/raft-cluster'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        studentId: 'usr-student-1',
        title: 'AWS Certified Machine Learning – Specialty',
        issuer: 'Amazon Web Services',
        issueDate: 'December 2025',
        credentialId: 'AWS-MLS-89021',
        skillTags: ['Machine Learning', 'SageMaker', 'Cloud Data Pipelines']
      },
      {
        id: 'cert-2',
        studentId: 'usr-student-1',
        title: 'Deep Learning Specialization',
        issuer: 'DeepLearning.AI / Coursera',
        issueDate: 'October 2025',
        credentialId: 'DL-SPEC-44129',
        skillTags: ['Neural Networks', 'PyTorch', 'Computer Vision']
      }
    ]
  },
  // Male student 1: Max Stem (from reference image)
  {
    id: 'rec-2',
    studentId: 'usr-student-2',
    srn: 'CS2022-005',
    studentName: 'Max Stem',
    gender: 'male',
    avatarUrl: AVATARS.men.maxStem,
    semester: 6,
    currentCGPA: 5.8,
    predictedCGPA: 5.6,
    attendancePercentage: 64,
    previousSemesterMarks: 52,
    internalAssessmentMarks: 24, // out of 50
    studyHoursPerDay: 1.5,
    assignmentCompletionPercentage: 58,
    backlogs: 2,
    classParticipationPercentage: 42,
    finalMarks: 51.2,
    riskLevel: 'High Risk',
    performanceStatus: 'Lagging',
    lastUpdated: '2026-03-02T11:00:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Male student 2: Orville Nilo (from reference image)
  {
    id: 'rec-3',
    studentId: 'usr-student-3',
    srn: 'CS2022-019',
    studentName: 'Orville Nilo',
    gender: 'male',
    avatarUrl: AVATARS.men.orvilleNilo,
    semester: 6,
    currentCGPA: 7.2,
    predictedCGPA: 7.4,
    attendancePercentage: 79,
    previousSemesterMarks: 71,
    internalAssessmentMarks: 36, // out of 50
    studyHoursPerDay: 3.2,
    assignmentCompletionPercentage: 82,
    backlogs: 0,
    classParticipationPercentage: 74,
    finalMarks: 72.5,
    riskLevel: 'Low Risk',
    performanceStatus: 'On Track',
    lastUpdated: '2026-03-02T12:00:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Female student: Emma Garfield (from reference image)
  {
    id: 'rec-4',
    studentId: 'usr-student-4',
    srn: 'CS2022-031',
    studentName: 'Emma Garfield',
    gender: 'female',
    avatarUrl: AVATARS.women.emmaGarfield,
    semester: 6,
    currentCGPA: 9.1,
    predictedCGPA: 9.3,
    attendancePercentage: 95,
    previousSemesterMarks: 89,
    internalAssessmentMarks: 47, // out of 50
    studyHoursPerDay: 5.2,
    assignmentCompletionPercentage: 98,
    backlogs: 0,
    classParticipationPercentage: 92,
    finalMarks: 91.8,
    riskLevel: 'Low Risk',
    performanceStatus: 'Ahead',
    lastUpdated: '2026-03-03T10:00:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Male student: Nate Hems (from reference image)
  {
    id: 'rec-5',
    studentId: 'usr-student-5',
    srn: 'CS2022-044',
    studentName: 'Nate Hems',
    gender: 'male',
    avatarUrl: AVATARS.men.nateHems,
    semester: 6,
    currentCGPA: 8.4,
    predictedCGPA: 8.5,
    attendancePercentage: 86,
    previousSemesterMarks: 80,
    internalAssessmentMarks: 42, // out of 50
    studyHoursPerDay: 4.0,
    assignmentCompletionPercentage: 90,
    backlogs: 0,
    classParticipationPercentage: 84,
    finalMarks: 83.2,
    riskLevel: 'Low Risk',
    performanceStatus: 'Completed',
    lastUpdated: '2026-03-03T11:30:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Male student: Wong Lee (from reference image: Bottom 3 Struggling)
  {
    id: 'rec-6',
    studentId: 'usr-student-6',
    srn: 'CS2022-052',
    studentName: 'Wong Lee',
    gender: 'male',
    avatarUrl: AVATARS.men.wongLee,
    semester: 6,
    currentCGPA: 4.9,
    predictedCGPA: 4.8,
    attendancePercentage: 58,
    previousSemesterMarks: 46,
    internalAssessmentMarks: 21, // out of 50
    studyHoursPerDay: 1.0,
    assignmentCompletionPercentage: 45,
    backlogs: 3,
    classParticipationPercentage: 35,
    finalMarks: 44.0,
    riskLevel: 'High Risk',
    performanceStatus: 'Lagging',
    lastUpdated: '2026-03-04T09:00:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Female student: Sarah Nancy (from reference image: Bottom 3 Struggling)
  {
    id: 'rec-7',
    studentId: 'usr-student-7',
    srn: 'CS2022-067',
    studentName: 'Sarah Nancy',
    gender: 'female',
    avatarUrl: AVATARS.women.sarahNancy,
    semester: 6,
    currentCGPA: 5.4,
    predictedCGPA: 5.5,
    attendancePercentage: 62,
    previousSemesterMarks: 50,
    internalAssessmentMarks: 26, // out of 50
    studyHoursPerDay: 1.8,
    assignmentCompletionPercentage: 60,
    backlogs: 2,
    classParticipationPercentage: 45,
    finalMarks: 52.5,
    riskLevel: 'High Risk',
    performanceStatus: 'Lagging',
    lastUpdated: '2026-03-04T10:15:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  },
  // Female student: Clara Garcia (from reference image: Top 3 Excelling)
  {
    id: 'rec-8',
    studentId: 'usr-student-8',
    srn: 'CS2022-073',
    studentName: 'Clara Garcia',
    gender: 'female',
    avatarUrl: AVATARS.women.claraGarcia,
    semester: 6,
    currentCGPA: 9.3,
    predictedCGPA: 9.5,
    attendancePercentage: 96,
    previousSemesterMarks: 91,
    internalAssessmentMarks: 48, // out of 50
    studyHoursPerDay: 5.5,
    assignmentCompletionPercentage: 100,
    backlogs: 0,
    classParticipationPercentage: 95,
    finalMarks: 94.2,
    riskLevel: 'Low Risk',
    performanceStatus: 'Ahead',
    lastUpdated: '2026-03-04T11:45:00Z',
    subjectPerformance: [],
    dailyTasks: [],
    projects: [],
    certifications: []
  }
];

export const INITIAL_MODEL_METRICS: ModelMetrics = {
  regression: {
    mae: 2.34,
    rmse: 3.12,
    r2Score: 0.918,
    meanActual: 68.7,
    meanPredicted: 68.4
  },
  classification: {
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.6,
    f1Score: 94.2,
    confusionMatrix: {
      labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
      matrix: [
        [142, 6, 1],
        [5, 84, 4],
        [0, 3, 55]
      ]
    }
  },
  featureImportances: [
    { feature: 'attendancePercentage', label: 'Attendance Percentage', importancePercentage: 27.5 },
    { feature: 'internalAssessmentMarksOutOf50', label: 'Internal Marks (/50)', importancePercentage: 25.4 },
    { feature: 'previousSemesterMarks', label: 'Previous Semester Marks', importancePercentage: 20.6 },
    { feature: 'studyHoursPerDay', label: 'Daily Study Hours', importancePercentage: 13.4 },
    { feature: 'backlogs', label: 'Active Backlogs', importancePercentage: 7.6 },
    { feature: 'assignmentCompletionPercentage', label: 'Assignment Completion', importancePercentage: 3.8 },
    { feature: 'classParticipationPercentage', label: 'Class Participation', importancePercentage: 1.7 }
  ],
  totalTrainingRecords: 1200,
  lastTrainedAt: '2026-03-01T04:30:00Z',
  status: 'Ready'
};

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-05T09:12:00Z',
    action: 'Digital Student Twin Simulated',
    userEmail: 'sarah.patel@edupredict.edu',
    details: 'Simulated +10% attendance and +5 marks in internal exams; projected +4.8% final marks boost.',
    severity: 'info'
  },
  {
    id: 'log-2',
    timestamp: '2026-03-05T08:45:00Z',
    action: 'K-Means Cohort Partition',
    userEmail: 'micheal.sykse@edupredict.edu',
    details: 'K-Means converged into 3 clusters: Advanced (50%), Proficient (30%), Lagging (20%).',
    severity: 'info'
  },
  {
    id: 'log-3',
    timestamp: '2026-03-04T17:30:00Z',
    action: 'Live Test Completed',
    userEmail: 'sarah.patel@edupredict.edu',
    details: 'Completed Unit 3 Random Forest Live Assessment with 4/4 score (100%).',
    severity: 'info'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Attendance Safety Alert',
    message: 'Compiler Design (CS604) attendance is 84% (27/32 classes). You can miss at most 4 more hours to stay safely above 75%.',
    timestamp: '10 mins ago',
    read: false,
    type: 'warning',
    actionTab: 'attendance'
  },
  {
    id: 'notif-2',
    title: 'Internal Assessment Recorded',
    message: 'Continuous Internal Assessment for Distributed Cloud Systems (CS602) was entered as 42/50.',
    timestamp: '2 hours ago',
    read: false,
    type: 'info',
    actionTab: 'subjects'
  },
  {
    id: 'notif-3',
    title: 'AI Practice Test Available',
    message: 'Diagnostic test for "Decision Trees & Random Forests" is ready based on your enrolled subjects.',
    timestamp: 'Yesterday',
    read: false,
    type: 'info',
    actionTab: 'tests'
  },
  {
    id: 'notif-4',
    title: 'Timetable Schedule Confirmed',
    message: 'AI & Machine Learning Lab session on Friday is confirmed in Computing Lab 4.',
    timestamp: '2 days ago',
    read: true,
    type: 'success',
    actionTab: 'timetable'
  }
];

