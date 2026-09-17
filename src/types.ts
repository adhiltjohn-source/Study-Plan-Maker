export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled' | 'overdue';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Subject {
  id: string;
  name: string;
  color: string;
  difficulty: Difficulty;
  priority?: Priority;
  targetExamDate?: string;
  icon?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  difficulty: Difficulty | number;
  estimatedMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
  isCompleted?: boolean;
  priority?: Priority;
  notes?: string;
  lastStudiedDate?: string;
  weakScoreCount?: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  notes?: string;
  priority: Priority;
}

export interface Task {
  id: string;
  subjectId?: string;
  topicId?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  duration: number; // minutes
  priority: Priority;
  status: TaskStatus;
  isDailyTest?: boolean;
}

export interface DayAvailability {
  availableMinutes: number;
  enabled: boolean;
  preferredSlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface UnavailableWindow {
  id: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isRecurring?: boolean;
}

export interface AvailabilityConfig {
  days: Record<DayOfWeek, DayAvailability>;
  bufferPercentage: number; // e.g. 15% capacity left unused for schedule changes
  unavailableWindows: UnavailableWindow[];
  includeDailyTestInStudyTime: boolean;
  preferredDailyTestTime: string; // e.g. "19:00"
  maxDailyStudyMinutes: number;
  preferredSessionDuration: number;
  breakDuration: number;
}

export interface WeakTopicInfo {
  subjectId: string;
  testedCount: number;
  correctCount: number;
  lastTestedDate: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string;
  topicName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  status: SessionStatus;
  actualMinutes?: number;
  isDailyTest?: boolean;
  isRevision?: boolean;
  notes?: string;
}

export interface Question {
  id: string;
  subjectId: string;
  topicId?: string;
  topicName: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  difficulty: Difficulty;
}

export interface TestAnswerRecord {
  questionId: string;
  selectedOption: number; // -1 if skipped
  isCorrect: boolean;
}

export interface DailyTestSubmission {
  id: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
  durationSeconds: number; // seconds taken
  score: number; // out of 20
  totalMarks: number; // 20
  answers: TestAnswerRecord[];
  subjectScores: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  rememberedTopics: string[];
}

export interface ReviewBookmark {
  id: string;
  questionId: string;
  addedAt: string;
  userNotes?: string;
}

export interface ReschedulingSuggestion {
  id: string;
  originalSessionId: string;
  subjectId: string;
  subjectName: string;
  topicName?: string;
  missedMinutes: number;
  reason: string;
  proposals: {
    date: string;
    startTime: string;
    duration: number;
  }[];
  applied: boolean;
  createdAt: string;
}

export interface FeasibilityReport {
  totalWorkloadMinutes: number;
  totalAvailableMinutes: number;
  bufferMinutes: number;
  deficitMinutes: number;
  isFeasible: boolean;
  daysToNextExam: number;
  nextExamName?: string;
  subjectsBreakdown: {
    subjectId: string;
    subjectName: string;
    requiredMinutes: number;
    urgencyScore: number;
  }[];
}

export interface UserProfile {
  name: string;
  studyGoal: string;
  gradeLevel: string;
}
