import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Subject, Topic, Priority } from '../types';

export const SubjectsManager: React.FC = () => {
  const {
    subjects,
    topics,
    addSubject,
    editSubject,
    deleteSubject,
    addTopic,
    editTopic,
    deleteTopic,
    toggleTopicCompletion,
    regeneratePlan,
  } = useStudy();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    subjects[0]?.id || null
  );

  // Subject Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subColor, setSubColor] = useState('#3b82f6');
  const [subDifficulty, setSubDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [subPriority, setSubPriority] = useState<Priority>('Medium');
  const [subExamDate, setSubExamDate] = useState('');

  // Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicTargetSubjectId, setTopicTargetSubjectId] = useState<string>(subjects[0]?.id || '');
  const [topicName, setTopicName] = useState('');
  const [topicEstimatedMinutes, setTopicEstimatedMinutes] = useState(120);
  const [topicDifficulty, setTopicDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [topicPriority, setTopicPriority] = useState<Priority>('Medium');
  const [topicNotes, setTopicNotes] = useState('');

  // Predefined color swatches
  const COLOR_SWATCHES = [
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
  ];

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    if (editingSub) {
      editSubject(editingSub.id, {
        name: subName,
        color: subColor,
        difficulty: subDifficulty,
        priority: subPriority,
        targetExamDate: subExamDate || undefined,
      });
      setEditingSub(null);
    } else {
      addSubject({
        name: subName,
        color: subColor,
        difficulty: subDifficulty,
        priority: subPriority,
        targetExamDate: subExamDate || undefined,
      });
    }

    setIsSubModalOpen(false);
    setSubName('');
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;

    if (editingTopic) {
      editTopic(editingTopic.id, {
        subjectId: topicTargetSubjectId,
        name: topicName,
        estimatedMinutes: Number(topicEstimatedMinutes),
        difficulty: topicDifficulty,
        priority: topicPriority,
        notes: topicNotes,
      });
      setEditingTopic(null);
    } else {
      addTopic({
        subjectId: topicTargetSubjectId,
        name: topicName,
        estimatedMinutes: Number(topicEstimatedMinutes),
        difficulty: topicDifficulty,
        priority: topicPriority,
        notes: topicNotes,
        isCompleted: false,
      });
    }

    setIsTopicModalOpen(false);
    setTopicName('');
    setTopicNotes('');
  };

  const openEditSubject = (sub: Subject) => {
    setEditingSub(sub);
    setSubName(sub.name);
    setSubColor(sub.color);
    setSubDifficulty(sub.difficulty);
    setSubPriority(sub.priority);
    setSubExamDate(sub.targetExamDate || '');
    setIsSubModalOpen(true);
  };

  const openEditTopic = (top: Topic) => {
    setEditingTopic(top);
    setTopicTargetSubjectId(top.subjectId);
    setTopicName(top.name);
    setTopicEstimatedMinutes(top.estimatedMinutes);
    setTopicDifficulty(top.difficulty);
    setTopicPriority(top.priority);
    setTopicNotes(top.notes || '');
    setIsTopicModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Academic Structure & Syllabus</span>
            <span>•</span>
            <span>Section 7 Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Subjects & Syllabus Topics
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Define subjects, set estimated revision times, and log topic completions to train the scheduling algorithm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="subj-add-topic-btn"
            onClick={() => {
              setEditingTopic(null);
              setTopicTargetSubjectId(expandedSubjectId || subjects[0]?.id || '');
              setIsTopicModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Topic</span>
          </button>
          <button
            id="subj-add-subject-btn"
            onClick={() => {
              setEditingSub(null);
              setIsSubModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* Subjects Accordion List */}
      <div className="space-y-4">
        {subjects.map((sub) => {
          const subTopics = topics.filter((t) => t.subjectId === sub.id);
          const completedCount = subTopics.filter((t) => t.isCompleted).length;
          const totalEstMinutes = subTopics.reduce((acc, t) => acc + t.estimatedMinutes, 0);
          const remainingMinutes = subTopics
            .filter((t) => !t.isCompleted)
            .reduce((acc, t) => acc + t.estimatedMinutes, 0);
          const isExpanded = expandedSubjectId === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              {/* Subject Row Header */}
              <div
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/40 transition-colors"
                onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: sub.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{sub.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          sub.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-800'
                            : sub.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-700">
                      <span>{subTopics.length} topics</span>
                      <span>·</span>
                      <span>{completedCount} completed</span>
                      <span>·</span>
                      <span>Remaining workload: {Math.round(remainingMinutes / 60)}h</span>
                      {sub.targetExamDate && (
                        <>
                          <span>·</span>
                          <span className="text-rose-600 font-semibold font-mono">
                            Target Exam: {sub.targetExamDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-900">
                      {subTopics.length > 0
                        ? Math.round((completedCount / subTopics.length) * 100)
                        : 0}
                      %
                    </span>
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          backgroundColor: sub.color,
                          width: `${
                            subTopics.length > 0 ? (completedCount / subTopics.length) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditSubject(sub)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSubject(sub.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Sub-topics Area */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span>Syllabus Topics ({subTopics.length})</span>
                    <button
                      onClick={() => {
                        setEditingTopic(null);
                        setTopicTargetSubjectId(sub.id);
                        setIsTopicModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 lowercase first-letter:uppercase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add topic to {sub.name}</span>
                    </button>
                  </div>

                  {subTopics.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-700 italic">No topics added to this subject yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {subTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                            topic.isCompleted
                              ? 'bg-slate-100/70 border-slate-200 opacity-75'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleTopicCompletion(topic.id)}
                              className="mt-0.5 shrink-0"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  topic.isCompleted
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 hover:border-blue-500'
                                }`}
                              >
                                {topic.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <h5
                                  className={`text-xs font-bold ${
                                    topic.isCompleted
                                      ? 'line-through text-slate-600'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {topic.name}
                                </h5>
                                <span className="text-[10px] font-semibold text-slate-700">
                                  {topic.estimatedMinutes}m est.
                                </span>
                              </div>

                              {topic.notes && (
                                <p className="text-[11px] text-slate-700 mt-0.5 line-clamp-1">
                                  {topic.notes}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-700">
                                <span>Difficulty: {topic.difficulty}/5</span>
                                <span>·</span>
                                <span
                                  className={
                                    topic.priority === 'Urgent'
                                      ? 'text-rose-600 font-bold'
                                      : 'text-slate-700'
                                  }
                                >
                                  {topic.priority} Priority
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditTopic(topic)}
                              className="p-1 rounded text-slate-600 hover:text-slate-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTopic(topic.id)}
                              className="p-1 rounded text-slate-600 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subject Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSub ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Biology, World History"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Color Accent</label>
                <div className="flex items-center gap-2">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSubColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        subColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Difficulty</label>
                  <select
                    value={subDifficulty}
                    onChange={(e) => setSubDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard (High Effort)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={subPriority}
                    onChange={(e) => setSubPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Final Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={subExamDate}
                  onChange={(e) => setSubExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  {editingSub ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTopic ? 'Edit Syllabus Topic' : 'Add Syllabus Topic'}
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={topicTargetSubjectId}
                  onChange={(e) => setTopicTargetSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g., Electromagnetic Induction, Photosynthesis"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={30}
                    step={15}
                    value={topicEstimatedMinutes}
                    onChange={(e) => setTopicEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Topic Difficulty (1-5)
                  </label>
                  <select
                    value={topicDifficulty}
                    onChange={(e) => setTopicDifficulty(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={1}>1 - Simple</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Hard</option>
                    <option value={5}>5 - Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={topicPriority}
                  onChange={(e) => setTopicPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes / References (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Textbook pages, key formulas..."
                  value={topicNotes}
                  onChange={(e) => setTopicNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  {editingTopic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
