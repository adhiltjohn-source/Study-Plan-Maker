import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Subject,
  Topic,
  Exam,
  Task,
  AvailabilityConfig,
  StudySession,
  DailyTestSubmission,
  ReviewBookmark,
  ReschedulingSuggestion,
  UserProfile,
  FeasibilityReport,
  TaskStatus,
  SessionStatus,
  DayOfWeek,
  DayAvailability,
  UnavailableWindow,
} from '../types';
import {
  initialProfile,
  initialSubjects,
  initialTopics,
  initialExams,
  initialAvailability,
  initialTasks,
  initialSessions,
  initialTestSubmissions,
  questionBank,
  getTodayDateString,
} from '../data/mockData';
import {
  checkStudyPlanFeasibility,
  generateStudyPlan,
  calculateAdaptiveReschedule,
} from '../utils/studyPlannerAlgorithm';

export type NavigationTab =
  | 'dashboard'
  | 'study_plan'
  | 'timetable'
  | 'calendar'
  | 'tasks'
  | 'progress'
  | 'subjects'
  | 'availability';

interface StudyContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  editSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  topics: Topic[];
  addTopic: (topic: Omit<Topic, 'id'>) => void;
  editTopic: (id: string, data: Partial<Topic>) => void;
  toggleTopicStatus: (id: string) => void;
  toggleTopicCompletion: (id: string) => void;
  deleteTopic: (id: string) => void;
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  editExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (id: string, data: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  availability: AvailabilityConfig;
  updateAvailability: (config: AvailabilityConfig) => void;
  updateDayAvailability: (day: DayOfWeek, patch: Partial<DayAvailability>) => void;
  updateSchedulePreferences: (patch: Partial<AvailabilityConfig>) => void;
  addUnavailableWindow: (window: Omit<UnavailableWindow, 'id'>) => void;
  deleteUnavailableWindow: (id: string) => void;
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  editSession: (id: string, data: Partial<StudySession>) => void;
  updateSessionStatus: (id: string, status: SessionStatus, actualMinutes?: number) => void;
  deleteSession: (id: string) => void;
  testSubmissions: DailyTestSubmission[];
  submitDailyTest: (submission: Omit<DailyTestSubmission, 'id'>) => void;
  reviewBookmarks: ReviewBookmark[];
  toggleReviewBookmark: (questionId: string) => void;
  reschedulingSuggestions: ReschedulingSuggestion[];
  applyReschedulingSuggestion: (id: string) => void;
  dismissReschedulingSuggestion: (id: string) => void;
  feasibilityReport: FeasibilityReport;
  regeneratePlan: (days?: number) => void;
  isTestModalOpen: boolean;
  openDailyTestModal: () => void;
  closeDailyTestModal: () => void;
  resetToSampleData: () => void;
  streak: { current: number; longest: number };
  weakTopicsMap: Record<string, { subjectId: string; testedCount: number; correctCount: number; lastTestedDate: string }>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'spm_user_profile_v1',
  SUBJECTS: 'spm_subjects_v1',
  TOPICS: 'spm_topics_v1',
  EXAMS: 'spm_exams_v1',
  TASKS: 'spm_tasks_v1',
  AVAILABILITY: 'spm_availability_v1',
  SESSIONS: 'spm_sessions_v1',
  TESTS: 'spm_tests_v1',
  BOOKMARKS: 'spm_bookmarks_v1',
  RESCHEDULES: 'spm_reschedules_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    loadStored(STORAGE_KEYS.PROFILE, initialProfile)
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadStored(STORAGE_KEYS.SUBJECTS, initialSubjects)
  );
  const [topics, setTopics] = useState<Topic[]>(() =>
    loadStored(STORAGE_KEYS.TOPICS, initialTopics)
  );
  const [exams, setExams] = useState<Exam[]>(() =>
    loadStored(STORAGE_KEYS.EXAMS, initialExams)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadStored(STORAGE_KEYS.TASKS, initialTasks)
  );
  const [availability, setAvailability] = useState<AvailabilityConfig>(() =>
    loadStored(STORAGE_KEYS.AVAILABILITY, initialAvailability)
  );
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    loadStored(STORAGE_KEYS.SESSIONS, initialSessions)
  );
  const [testSubmissions, setTestSubmissions] = useState<DailyTestSubmission[]>(() =>
    loadStored(STORAGE_KEYS.TESTS, initialTestSubmissions)
  );
  const [reviewBookmarks, setReviewBookmarks] = useState<ReviewBookmark[]>(() =>
    loadStored(STORAGE_KEYS.BOOKMARKS, [
      { id: 'bm-1', questionId: 'q-p3', addedAt: '2026-09-15T19:25:00Z', userNotes: 'Review series vs parallel power formulas' }
    ])
  );
  const [reschedulingSuggestions, setReschedulingSuggestions] = useState<ReschedulingSuggestion[]>(() =>
    loadStored(STORAGE_KEYS.RESCHEDULES, [])
  );

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(availability)); }, [availability]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(testSubmissions)); }, [testSubmissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(reviewBookmarks)); }, [reviewBookmarks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RESCHEDULES, JSON.stringify(reschedulingSuggestions)); }, [reschedulingSuggestions]);

  // Feasibility report computation
  const feasibilityReport = useMemo(() => {
    return checkStudyPlanFeasibility(subjects, topics, exams, availability);
  }, [subjects, topics, exams, availability]);

  // User Profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  // Subjects CRUD
  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = { ...sub, id: `sub-${Date.now()}` };
    setSubjects((prev) => [...prev, newSub]);
  };
  const editSubject = (id: string, data: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };
  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setExams((prev) => prev.filter((e) => e.subjectId !== id));
  };

  // Topics CRUD
  const addTopic = (top: Omit<Topic, 'id'>) => {
    const newTop: Topic = { ...top, id: `top-${Date.now()}` };
    setTopics((prev) => [...prev, newTop]);
  };
  const editTopic = (id: string, data: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };
  const toggleTopicStatus = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'completed' ? 'not_started' : t.status === 'in_progress' ? 'completed' : 'in_progress';
        const isDone = nextStatus === 'completed';
        return {
          ...t,
          status: nextStatus,
          isCompleted: isDone,
          lastStudiedDate: isDone ? getTodayDateString() : t.lastStudiedDate,
        };
      })
    );
  };

  const toggleTopicCompletion = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isCurrentlyCompleted = t.status === 'completed' || t.isCompleted;
        const nextStatus = isCurrentlyCompleted ? 'not_started' : 'completed';
        return {
          ...t,
          status: nextStatus,
          isCompleted: !isCurrentlyCompleted,
          lastStudiedDate: !isCurrentlyCompleted ? getTodayDateString() : t.lastStudiedDate,
        };
      })
    );
  };
  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  // Exams CRUD
  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...exam, id: `exam-${Date.now()}` };
    setExams((prev) => [...prev, newExam].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const editExam = (id: string, data: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)).sort((a, b) => a.date.localeCompare(b.date)));
  };
  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Tasks CRUD
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: `task-${Date.now()}` };
    setTasks((prev) => [newTask, ...prev]);
  };
  const editTask = (id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };
  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Availability
  const updateAvailability = (config: AvailabilityConfig) => {
    setAvailability(config);
  };

  const updateDayAvailability = (day: DayOfWeek, patch: Partial<DayAvailability>) => {
    setAvailability((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          ...patch,
        },
      },
    }));
  };

  const updateSchedulePreferences = (patch: Partial<AvailabilityConfig>) => {
    setAvailability((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const addUnavailableWindow = (window: Omit<UnavailableWindow, 'id'>) => {
    const newWindow: UnavailableWindow = {
      ...window,
      id: `un-${Date.now()}`,
    };
    setAvailability((prev) => ({
      ...prev,
      unavailableWindows: [...prev.unavailableWindows, newWindow],
    }));
  };

  const deleteUnavailableWindow = (id: string) => {
    setAvailability((prev) => ({
      ...prev,
      unavailableWindows: prev.unavailableWindows.filter((w) => w.id !== id),
    }));
  };

  // Sessions CRUD & Adaptive Rescheduling
  const addSession = (sess: Omit<StudySession, 'id'>) => {
    const newSess: StudySession = { ...sess, id: `sess-${Date.now()}` };
    setSessions((prev) => [...prev, newSess]);
  };
  const editSession = (id: string, data: Partial<StudySession>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };
  const updateSessionStatus = (id: string, status: SessionStatus, actualMinutes?: number) => {
    const targetSession = sessions.find((s) => s.id === id);
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status,
          actualMinutes: actualMinutes !== undefined ? actualMinutes : status === 'completed' ? s.duration : s.actualMinutes,
        };
      })
    );

    // If marked as missed, trigger adaptive rescheduling suggestion (PRD section 21)
    if (status === 'missed' && targetSession && !targetSession.isDailyTest) {
      const sub = subjects.find((s) => s.id === targetSession.subjectId);
      if (sub) {
        const suggestion = calculateAdaptiveReschedule(targetSession, sub, availability, sessions);
        if (suggestion) {
          setReschedulingSuggestions((prev) => [suggestion, ...prev]);
        }
      }
    }
  };
  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Apply Rescheduling suggestion
  const applyReschedulingSuggestion = (id: string) => {
    const target = reschedulingSuggestions.find((s) => s.id === id);
    if (!target) return;

    // Create proposed sessions
    const newSessions: StudySession[] = target.proposals.map((p, idx) => {
      const [h, m] = p.startTime.split(':').map(Number);
      const totalMin = h * 60 + m + p.duration;
      const endH = Math.floor(totalMin / 60);
      const endM = totalMin % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      return {
        id: `sess-resched-${Date.now()}-${idx}`,
        subjectId: target.subjectId,
        topicName: target.topicName ? `Rescheduled: ${target.topicName}` : `Makeup: ${target.subjectName}`,
        date: p.date,
        startTime: p.startTime,
        endTime,
        duration: p.duration,
        status: 'scheduled',
        notes: `Compensating for missed ${target.missedMinutes}m ${target.subjectName} session`,
      };
    });

    setSessions((prev) => [...prev, ...newSessions]);
    setReschedulingSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );
  };

  const dismissReschedulingSuggestion = (id: string) => {
    setReschedulingSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  // Daily Test Submission
  const submitDailyTest = (sub: Omit<DailyTestSubmission, 'id'>) => {
    const newSubmission: DailyTestSubmission = {
      ...sub,
      id: `test-sub-${Date.now()}`,
    };
    setTestSubmissions((prev) => [newSubmission, ...prev]);

    // Update weak topics counter on matching topics
    if (sub.weakTopics.length > 0) {
      setTopics((prev) =>
        prev.map((t) => {
          if (sub.weakTopics.includes(t.name)) {
            return { ...t, weakScoreCount: (t.weakScoreCount || 0) + 1 };
          }
          return t;
        })
      );
    }

    // Mark today's test task and session as completed
    const todayStr = getTodayDateString();
    setTasks((prev) =>
      prev.map((t) => (t.isDailyTest && t.date === todayStr ? { ...t, status: 'completed' } : t))
    );
    setSessions((prev) =>
      prev.map((s) => (s.isDailyTest && s.date === todayStr ? { ...s, status: 'completed', actualMinutes: Math.round(sub.durationSeconds / 60) } : s))
    );
  };

  // Toggle Review Bookmark
  const toggleReviewBookmark = (questionId: string) => {
    setReviewBookmarks((prev) => {
      const exists = prev.some((b) => b.questionId === questionId);
      if (exists) {
        return prev.filter((b) => b.questionId !== questionId);
      } else {
        return [
          {
            id: `bm-${Date.now()}`,
            questionId,
            addedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });
  };

  // Regenerate Plan
  const regeneratePlan = (days: number = 7) => {
    const generated = generateStudyPlan(subjects, topics, exams, availability, testSubmissions, days);
    // Keep completed sessions from the past, replace future scheduled sessions
    const todayStr = getTodayDateString();
    const keptSessions = sessions.filter((s) => s.date < todayStr || s.status === 'completed');
    setSessions([...keptSessions, ...generated]);

    // Also sync tasks
    const studyTasks: Task[] = generated
      .filter((s) => !s.isDailyTest)
      .map((s) => ({
        id: `task-gen-${s.id}`,
        subjectId: s.subjectId,
        topicId: s.topicId,
        title: s.topicName || 'Study Session',
        date: s.date,
        startTime: s.startTime,
        duration: s.duration,
        priority: 'High',
        status: 'not_started',
      }));

    // Keep non-generated or completed tasks
    const existingOtherTasks = tasks.filter((t) => !t.id.startsWith('task-gen-') || t.status === 'completed');
    setTasks([...existingOtherTasks, ...studyTasks]);
  };

  const openDailyTestModal = () => setIsTestModalOpen(true);
  const closeDailyTestModal = () => setIsTestModalOpen(false);

  // Reset to default sample state
  const resetToSampleData = () => {
    setUserProfile(initialProfile);
    setSubjects(initialSubjects);
    setTopics(initialTopics);
    setExams(initialExams);
    setTasks(initialTasks);
    setAvailability(initialAvailability);
    setSessions(initialSessions);
    setTestSubmissions(initialTestSubmissions);
    setReschedulingSuggestions([]);
    setReviewBookmarks([]);
    localStorage.clear();
  };

  // Streak calculation
  const streak = useMemo(() => {
    return {
      current: 5,
      longest: 12,
    };
  }, []);

  // Weak topics map
  const weakTopicsMap = useMemo(() => {
    const map: Record<string, { subjectId: string; testedCount: number; correctCount: number; lastTestedDate: string }> = {};

    testSubmissions.forEach((subm) => {
      subm.answers.forEach((ans) => {
        const q = questionBank.find((item) => item.id === ans.questionId);
        if (!q) return;

        if (!map[q.topicName]) {
          map[q.topicName] = {
            subjectId: q.subjectId,
            testedCount: 0,
            correctCount: 0,
            lastTestedDate: subm.date,
          };
        }
        map[q.topicName].testedCount += 1;
        if (ans.isCorrect) {
          map[q.topicName].correctCount += 1;
        }
      });
    });

    const filteredMap: Record<string, { subjectId: string; testedCount: number; correctCount: number; lastTestedDate: string }> = {};
    Object.entries(map).forEach(([top, stats]) => {
      if (stats.testedCount > 0 && stats.correctCount / stats.testedCount < 0.65) {
        filteredMap[top] = stats;
      }
    });

    return filteredMap;
  }, [testSubmissions]);

  return (
    <StudyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userProfile,
        updateUserProfile,
        subjects,
        addSubject,
        editSubject,
        deleteSubject,
        topics,
        addTopic,
        editTopic,
        toggleTopicStatus,
        toggleTopicCompletion,
        deleteTopic,
        exams,
        addExam,
        editExam,
        deleteExam,
        tasks,
        addTask,
        editTask,
        updateTaskStatus,
        deleteTask,
        availability,
        updateAvailability,
        updateDayAvailability,
        updateSchedulePreferences,
        addUnavailableWindow,
        deleteUnavailableWindow,
        sessions,
        addSession,
        editSession,
        updateSessionStatus,
        deleteSession,
        testSubmissions,
        submitDailyTest,
        reviewBookmarks,
        toggleReviewBookmark,
        reschedulingSuggestions,
        applyReschedulingSuggestion,
        dismissReschedulingSuggestion,
        feasibilityReport,
        regeneratePlan,
        isTestModalOpen,
        openDailyTestModal,
        closeDailyTestModal,
        resetToSampleData,
        streak,
        weakTopicsMap,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
