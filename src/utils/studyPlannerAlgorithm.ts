import {
  Subject,
  Topic,
  Exam,
  AvailabilityConfig,
  StudySession,
  Question,
  DailyTestSubmission,
  FeasibilityReport,
  ReschedulingSuggestion,
  DayOfWeek,
} from '../types';

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Calculates days remaining until a given date string (YYYY-MM-DD)
 */
export function getDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr + 'T23:59:59');
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Feasibility Check (Section 22 & 35)
 * Calculates required study time vs available capacity before upcoming exams
 */
export function checkStudyPlanFeasibility(
  subjects: Subject[],
  topics: Topic[],
  exams: Exam[],
  availability: AvailabilityConfig,
  daysHorizon: number = 30
): FeasibilityReport {
  // 1. Calculate remaining workload
  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const incompleteTopics = topics.filter((t) => t.status !== 'completed');

  let totalWorkloadMinutes = 0;
  const subjectsBreakdownMap: Record<string, { requiredMinutes: number; urgencyScore: number }> = {};

  subjects.forEach((s) => {
    subjectsBreakdownMap[s.id] = { requiredMinutes: 0, urgencyScore: 1 };
  });

  incompleteTopics.forEach((topic) => {
    const minutes = topic.estimatedMinutes || 120;
    totalWorkloadMinutes += minutes;
    if (subjectsBreakdownMap[topic.subjectId]) {
      subjectsBreakdownMap[topic.subjectId].requiredMinutes += minutes;
    }
  });

  // Calculate urgency based on closest exams
  let nearestExamDays = 999;
  let nextExamName: string | undefined;

  exams.forEach((exam) => {
    const days = getDaysRemaining(exam.date);
    if (days < nearestExamDays) {
      nearestExamDays = days;
      nextExamName = `${exam.name} (${days} days)`;
    }

    if (subjectsBreakdownMap[exam.subjectId]) {
      // Urgency multiplier: closer exams give higher urgency score
      const urgencyBoost = Math.max(1, Math.round(40 / Math.max(1, days)));
      subjectsBreakdownMap[exam.subjectId].urgencyScore += urgencyBoost;
    }
  });

  // 2. Calculate available capacity over daysHorizon (or days to nearest exam)
  const planningDays = Math.min(daysHorizon, Math.max(7, nearestExamDays === 999 ? 30 : nearestExamDays));
  let totalAvailableMinutes = 0;

  const today = new Date();
  for (let i = 0; i < planningDays; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + i);
    const dayName = DAYS_OF_WEEK[checkDate.getDay()];
    const dayConfig = availability.days[dayName];
    if (dayConfig && dayConfig.enabled) {
      totalAvailableMinutes += dayConfig.availableMinutes;
    }
  }

  // Deduct recommended buffer percentage (e.g. 15%)
  const bufferMinutes = Math.round(totalAvailableMinutes * (availability.bufferPercentage / 100));
  const effectiveCapacity = Math.max(0, totalAvailableMinutes - bufferMinutes);
  const deficitMinutes = Math.max(0, totalWorkloadMinutes - effectiveCapacity);

  const subjectsBreakdown = subjects.map((sub) => ({
    subjectId: sub.id,
    subjectName: sub.name,
    requiredMinutes: subjectsBreakdownMap[sub.id]?.requiredMinutes || 0,
    urgencyScore: subjectsBreakdownMap[sub.id]?.urgencyScore || 1,
  }));

  return {
    totalWorkloadMinutes,
    totalAvailableMinutes: effectiveCapacity,
    bufferMinutes,
    deficitMinutes,
    isFeasible: deficitMinutes === 0,
    daysToNextExam: nearestExamDays === 999 ? 30 : nearestExamDays,
    nextExamName,
    subjectsBreakdown,
  };
}

/**
 * Deterministic Study Plan Generator (Section 34)
 * Generates balanced study sessions, daily MCQ test slots, and revisions
 */
export function generateStudyPlan(
  subjects: Subject[],
  topics: Topic[],
  exams: Exam[],
  availability: AvailabilityConfig,
  recentSubmissions: DailyTestSubmission[],
  daysToPlan: number = 7
): StudySession[] {
  const sessions: StudySession[] = [];
  const today = new Date();

  // Map weak topics from recent tests
  const weakTopicNames = new Set<string>();
  recentSubmissions.slice(-3).forEach((sub) => {
    sub.weakTopics.forEach((wt) => weakTopicNames.add(wt.toLowerCase()));
  });

  // Calculate subject priority score
  const subjectPriority: Record<string, number> = {};
  subjects.forEach((sub) => {
    let score = sub.difficulty === 'Hard' ? 3 : sub.difficulty === 'Medium' ? 2 : 1;
    // Boost if exam is upcoming
    const subExams = exams.filter((e) => e.subjectId === sub.id);
    if (subExams.length > 0) {
      const minDays = Math.min(...subExams.map((e) => getDaysRemaining(e.date)));
      score += Math.max(1, Math.floor(30 / Math.max(1, minDays)));
    }
    subjectPriority[sub.id] = score;
  });

  // Pool of incomplete topics and completed topics (for revision)
  const remainingTopics = [...topics.filter((t) => t.status !== 'completed')];
  // Sort remaining topics: weak test topics first, then hard topics
  remainingTopics.sort((a, b) => {
    const aWeak = weakTopicNames.has(a.name.toLowerCase()) ? 5 : 0;
    const bWeak = weakTopicNames.has(b.name.toLowerCase()) ? 5 : 0;
    const aPri = (subjectPriority[a.subjectId] || 1) + (a.difficulty === 'Hard' ? 2 : 1) + aWeak;
    const bPri = (subjectPriority[b.subjectId] || 1) + (b.difficulty === 'Hard' ? 2 : 1) + bWeak;
    return bPri - aPri;
  });

  const completedTopics = topics.filter((t) => t.status === 'completed');

  let topicIndex = 0;
  let revisionIndex = 0;

  for (let dayOffset = 0; dayOffset < daysToPlan; dayOffset++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
    const dayConfig = availability.days[dayOfWeek];

    if (!dayConfig || !dayConfig.enabled || dayConfig.availableMinutes <= 0) {
      continue;
    }

    let dailyCapacity = dayConfig.availableMinutes;

    // Daily Test Slot: reserve 20 minutes
    const testSlotTime = availability.preferredDailyTestTime || '19:00';
    const [testHour, testMin] = testSlotTime.split(':').map(Number);
    const testEndMin = (testMin + 20) % 60;
    const testEndHour = testHour + Math.floor((testMin + 20) / 60);
    const testEndTimeStr = `${String(testEndHour).padStart(2, '0')}:${String(testEndMin).padStart(2, '0')}`;

    sessions.push({
      id: `gen-test-${dateStr}`,
      subjectId: 'sub-all',
      topicName: 'Daily 20-Min Retrieval Practice Test',
      date: dateStr,
      startTime: testSlotTime,
      endTime: testEndTimeStr,
      duration: 20,
      status: 'scheduled',
      isDailyTest: true,
      notes: '20 Questions · 20 Marks · Retrieval Practice',
    });

    if (availability.includeDailyTestInStudyTime) {
      dailyCapacity = Math.max(0, dailyCapacity - 20);
    }

    // Determine session start time based on preferredSlot
    let currentHour = dayConfig.preferredSlot === 'morning' ? 9 : dayConfig.preferredSlot === 'afternoon' ? 14 : 16;
    let currentMinute = 0;

    // Fill daily capacity in 45m - 60m blocks
    while (dailyCapacity >= 40) {
      const sessionDuration = dailyCapacity >= 75 ? 60 : dailyCapacity;

      // Every 3rd session, consider a revision session if completed topics exist
      const isRevision = topicIndex % 3 === 2 && completedTopics.length > 0;
      let chosenTopic: Topic | undefined;

      if (isRevision && completedTopics.length > 0) {
        chosenTopic = completedTopics[revisionIndex % completedTopics.length];
        revisionIndex++;
      } else if (remainingTopics.length > 0) {
        chosenTopic = remainingTopics[topicIndex % remainingTopics.length];
        topicIndex++;
      } else if (completedTopics.length > 0) {
        chosenTopic = completedTopics[revisionIndex % completedTopics.length];
        revisionIndex++;
      }

      if (!chosenTopic) break;

      const startFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      // Calculate end time
      let endMinutesTotal = currentHour * 60 + currentMinute + sessionDuration;
      let endHour = Math.floor(endMinutesTotal / 60);
      let endMin = endMinutesTotal % 60;
      const endFormatted = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      sessions.push({
        id: `gen-sess-${dateStr}-${sessions.length}`,
        subjectId: chosenTopic.subjectId,
        topicId: chosenTopic.id,
        topicName: isRevision ? `Revision: ${chosenTopic.name}` : chosenTopic.name,
        date: dateStr,
        startTime: startFormatted,
        endTime: endFormatted,
        duration: sessionDuration,
        status: 'scheduled',
        isRevision,
        notes: isRevision ? 'Retrieval practice & summary flashcards' : 'Core conceptual study & exercises',
      });

      dailyCapacity -= sessionDuration;

      // Add 15 minute break between study blocks
      let nextMinTotal = endHour * 60 + endMin + 15;
      currentHour = Math.floor(nextMinTotal / 60);
      currentMinute = nextMinTotal % 60;
    }
  }

  return sessions;
}

/**
 * Adaptive Rescheduling Helper (Section 21)
 * Suggests distribution of missed session minutes across upcoming days
 */
export function calculateAdaptiveReschedule(
  missedSession: StudySession,
  subject: Subject,
  availability: AvailabilityConfig,
  existingSessions: StudySession[]
): ReschedulingSuggestion | null {
  const missedDuration = missedSession.duration || 60;
  const missedDate = new Date(missedSession.date);

  // Look for next 2 active days
  const proposals: { date: string; startTime: string; duration: number }[] = [];
  const chunk1 = Math.round(missedDuration / 2);
  const chunk2 = missedDuration - chunk1;

  for (let i = 1; i <= 4 && proposals.length < 2; i++) {
    const candidateDate = new Date(missedDate);
    candidateDate.setDate(missedDate.getDate() + i);
    const dateStr = candidateDate.toISOString().split('T')[0];
    const dayName = DAYS_OF_WEEK[candidateDate.getDay()];
    const dayConfig = availability.days[dayName];

    if (dayConfig && dayConfig.enabled) {
      // Find latest session on that day to append
      const daySessions = existingSessions.filter((s) => s.date === dateStr);
      let proposedStart = '17:30';
      if (daySessions.length > 0) {
        const sorted = [...daySessions].sort((a, b) => b.endTime.localeCompare(a.endTime));
        const lastEnd = sorted[0].endTime;
        const [h, m] = lastEnd.split(':').map(Number);
        const newStartMin = m + 20;
        const newH = h + Math.floor(newStartMin / 60);
        const newM = newStartMin % 60;
        proposedStart = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      }

      proposals.push({
        date: dateStr,
        startTime: proposedStart,
        duration: proposals.length === 0 ? chunk1 : chunk2,
      });
    }
  }

  if (proposals.length === 0) return null;

  return {
    id: `resched-${Date.now()}`,
    originalSessionId: missedSession.id,
    subjectId: subject.id,
    subjectName: subject.name,
    topicName: missedSession.topicName,
    missedMinutes: missedDuration,
    reason: `${subject.name} session on ${missedSession.date} was not completed`,
    proposals,
    applied: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Retrieval Practice Daily MCQ Question Selection (Section 15 & 36)
 * 20 questions:
 * 40% (8 questions) - Recently studied
 * 30% (6 questions) - Weak areas / past incorrect
 * 20% (4 questions) - Older revision / upcoming exams
 * 10% (2 questions) - Mixed / general question bank pool
 */
export function selectDailyTestQuestions(
  questionBank: Question[],
  recentSubmissions: DailyTestSubmission[],
  recentSessions: StudySession[],
  exams: Exam[]
): Question[] {
  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  // Helper to safely pick questions
  const addQuestion = (q: Question) => {
    if (!selectedIds.has(q.id) && selected.length < 20) {
      selected.push(q);
      selectedIds.add(q.id);
    }
  };

  // 1. Weak topics from past submissions
  const weakTopicNames = new Set<string>();
  recentSubmissions.forEach((sub) => {
    sub.weakTopics.forEach((wt) => weakTopicNames.add(wt.toLowerCase()));
  });

  const weakPool = questionBank.filter(
    (q) => weakTopicNames.has(q.topicName.toLowerCase()) || q.difficulty === 'Hard'
  );

  // 2. Recently studied subject/topics from sessions
  const recentSubjectIds = new Set(recentSessions.slice(-4).map((s) => s.subjectId));
  const recentPool = questionBank.filter((q) => recentSubjectIds.has(q.subjectId));

  // 3. Upcoming exam subjects
  const upcomingExamSubjectIds = new Set(exams.map((e) => e.subjectId));
  const examPool = questionBank.filter((q) => upcomingExamSubjectIds.has(q.subjectId));

  // Target quotas: 8 recent, 6 weak, 4 exam/revision, 2 mixed
  // Shuffle pools
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  shuffle(recentPool).slice(0, 8).forEach(addQuestion);
  shuffle(weakPool).slice(0, 6).forEach(addQuestion);
  shuffle(examPool).slice(0, 4).forEach(addQuestion);

  // Fill remaining up to 20 from overall question bank
  const mixedPool = shuffle(questionBank);
  for (const q of mixedPool) {
    if (selected.length >= 20) break;
    addQuestion(q);
  }

  // If still fewer than 20 questions available in bank, loop with clones (fallback protection)
  let cloneIdx = 0;
  while (selected.length < 20 && questionBank.length > 0) {
    const base = questionBank[cloneIdx % questionBank.length];
    selected.push({
      ...base,
      id: `${base.id}-repeat-${selected.length}`,
    });
    cloneIdx++;
  }

  return shuffle(selected).slice(0, 20);
}
