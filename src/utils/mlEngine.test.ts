import test from 'node:test';
import assert from 'node:assert/strict';
import {
  predictStudentMarks,
  classifyAcademicRisk,
  marksToGrade,
  marksToCGPA,
  predictPassFail,
  computeShapAttributions,
  generateRecommendations,
  runPrediction,
  simulateDigitalStudentTwin,
  computeKMeansClusters
} from './mlEngine.ts';

test('predictStudentMarks handles internal marks out of 50', () => {
  const student = {
    attendancePercentage: 90,
    previousSemesterMarks: 85,
    internalAssessmentMarksOutOf50: 45, // 90%
    studyHoursPerDay: 5,
    assignmentCompletionPercentage: 95,
    backlogs: 0,
    classParticipationPercentage: 85
  };

  const marks = predictStudentMarks(student);
  assert.ok(marks >= 80 && marks <= 100, `Expected >= 80, got ${marks}`);

  const cgpa = marksToCGPA(marks);
  assert.ok(cgpa >= 8.0 && cgpa <= 10.0, `Expected CGPA >= 8.0, got ${cgpa}`);

  const { passFail, probability } = predictPassFail(marks, student.backlogs, student.attendancePercentage);
  assert.equal(passFail, 'PASS');
  assert.ok(probability > 85);
});

test('Digital Student Twin simulates what-if scenarios accurately', () => {
  const baseInput = {
    attendancePercentage: 70,
    previousSemesterMarks: 65,
    internalAssessmentMarksOutOf50: 30, // 60%
    studyHoursPerDay: 2,
    assignmentCompletionPercentage: 75,
    backlogs: 1,
    classParticipationPercentage: 60
  };

  const sim = simulateDigitalStudentTwin(baseInput, {
    attendanceDelta: 15,
    internalsOutOf50Delta: 10,
    studyHoursDelta: 2.5,
    backlogDelta: -1
  });

  assert.ok(sim.simulated.predictedMarks > sim.baseline.predictedMarks, 'Simulated marks should increase with improvements');
  assert.ok(sim.simulated.predictedCGPA > sim.baseline.predictedCGPA, 'Simulated CGPA should increase');
  assert.ok(sim.scenarioInsights.length > 0);
});

test('computeKMeansClusters clusters students into 3 performance categories', () => {
  const sampleCohort = [
    { id: '1', name: 'Alice', srn: 'S1', gender: 'female' as const, avatarUrl: '', attendance: 92, internalsOutOf50: 46, studyHours: 5, marks: 90, backlogs: 0 },
    { id: '2', name: 'Bob', srn: 'S2', gender: 'male' as const, avatarUrl: '', attendance: 78, internalsOutOf50: 36, studyHours: 3, marks: 72, backlogs: 0 },
    { id: '3', name: 'Charlie', srn: 'S3', gender: 'male' as const, avatarUrl: '', attendance: 58, internalsOutOf50: 22, studyHours: 1, marks: 44, backlogs: 2 }
  ];

  const clusters = computeKMeansClusters(sampleCohort);
  assert.equal(clusters.length, 3);
  assert.ok(clusters.some(c => c.label.includes('Advanced')));
  assert.ok(clusters.some(c => c.label.includes('Struggling')));
});
