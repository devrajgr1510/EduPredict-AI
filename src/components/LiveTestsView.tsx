import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { LiveTest, LiveTestQuestion } from '../types/index.ts';

interface LiveTestsViewProps {
  tests: LiveTest[];
  onCompleteTest: (testId: string, score: number, total: number) => void;
  onGenerateAiTest?: () => void;
}

export const LiveTestsView: React.FC<LiveTestsViewProps> = ({
  tests,
  onCompleteTest,
  onGenerateAiTest
}) => {
  const [activeTest, setActiveTest] = useState<LiveTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer countdown when taking active test
  useEffect(() => {
    if (!activeTest || isTestSubmitted || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, isTestSubmitted, timeLeftSeconds]);

  const handleStartTest = (test: LiveTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeftSeconds(test.durationMinutes * 60);
    setIsTestSubmitted(false);
    setShowExplanation(false);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isTestSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    if (!activeTest) return 0;
    let correct = 0;
    activeTest.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    const score = calculateScore();
    setIsTestSubmitted(true);
    onCompleteTest(activeTest.id, score, activeTest.questions.length);
  };

  const handleRetake = () => {
    if (!activeTest) return;
    handleStartTest(activeTest);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Live Interactive Academic Tests
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Timed subject assessments calibrated to test curriculum mastery, continuous evaluation, and exam readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTest && !isTestSubmitted ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-mono font-bold animate-pulse">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Time Remaining: {formatTimer(timeLeftSeconds)}</span>
            </div>
          ) : (
            onGenerateAiTest && (
              <button
                onClick={onGenerateAiTest}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>AI Generate Diagnostic Exam</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ACTIVE TEST TAKING VIEW */}
      {activeTest ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Test Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {activeTest.subjectCode} · {activeTest.subjectName}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeTest.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Question {currentQuestionIndex + 1} of {activeTest.questions.length}
              </span>
              <button
                onClick={() => setActiveTest(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
              >
                Exit Test
              </button>
            </div>
          </div>

          {/* Test Status Banner if Submitted */}
          {isTestSubmitted && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-600 text-white shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Assessment Evaluation Complete
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    Score: {calculateScore()} / {activeTest.questions.length} ({Math.round((calculateScore() / activeTest.questions.length) * 100)}%)
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {calculateScore() / activeTest.questions.length >= 0.7
                      ? 'Excellent performance! Proficient conceptual grasp.'
                      : 'Needs review. Review explanations below to strengthen concepts.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  {showExplanation ? 'Hide Explanations' : 'View Explanations'}
                </button>
              </div>
            </div>
          )}

          {/* Question Stepper Indicator */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeTest.questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              const isCorrect = isTestSubmitted && selectedAnswers[q.id] === q.correctIndex;
              const isWrong = isTestSubmitted && isAnswered && !isCorrect;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'ring-2 ring-blue-500 scale-105 shadow-sm'
                      : ''
                  } ${
                    isTestSubmitted
                      ? isCorrect
                        ? 'bg-emerald-500 text-white'
                        : isWrong
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                      : isAnswered
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Body */}
          {(() => {
            const currentQ: LiveTestQuestion = activeTest.questions[currentQuestionIndex];
            const chosenAnswer = selectedAnswers[currentQ.id];

            return (
              <div className="space-y-4 pt-2">
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  <span className="text-blue-600 mr-2">Q{currentQuestionIndex + 1}.</span>
                  {currentQ.question}
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = chosenAnswer === optIdx;
                    let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-900';

                    if (isTestSubmitted) {
                      if (optIdx === currentQ.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected && optIdx !== currentQ.correctIndex) {
                        optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 font-medium ring-1 ring-blue-500';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isTestSubmitted}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isTestSubmitted && optIdx === currentQ.correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isTestSubmitted && isSelected && optIdx !== currentQ.correctIndex && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Explanation if toggled or submitted */}
                {(showExplanation || isTestSubmitted) && (
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs space-y-1">
                    <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-500" />
                      <span>Academic Concept & Explanation</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Bottom Navigation between questions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeTest.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      !isTestSubmitted && (
                        <button
                          onClick={handleSubmitTest}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Test</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      ) : (
        /* TESTS CATALOG LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {test.subjectCode}
                  </span>
                  {test.completed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Score: {test.userScore ?? 5}/{test.totalQuestions}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {test.subjectName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{test.totalQuestions} Questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleStartTest(test)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    test.completed
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{test.completed ? 'Retake Assessment' : 'Start Live Test'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
