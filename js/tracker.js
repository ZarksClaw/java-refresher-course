const STORAGE_KEY = 'java-refresher-progress';

const Tracker = {
  _memory: {},
  storageAvailable: true,

  _load() {
    let data = this._memory;
    if (this.storageAvailable) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : this._memory;
      } catch {
        // A malformed value or unavailable storage starts from session state.
      }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
    const normalized = {};
    for (const chapter of CHAPTERS) {
      const saved = data[chapter.id] || {};
      const sameRevision = saved.revision === chapter.revision;
      normalized[chapter.id] = {
        revision: chapter.revision,
        stepsCompleted: Number.isInteger(saved.stepsCompleted)
          ? Math.max(0, Math.min(saved.stepsCompleted, chapter.steps.length)) : 0,
        // Expanded quizzes must be passed again; existing lesson progress is retained.
        quizPassed: sameRevision && saved.quizPassed === true,
        quizBest: sameRevision && Number.isInteger(saved.quizBest)
          ? Math.max(0, Math.min(saved.quizBest, chapter.quiz.length)) : 0
      };
    }
    return normalized;
  },

  _save(data) {
    this._memory = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      this.storageAvailable = false;
      const notice = document.getElementById('storage-notice');
      if (notice) notice.hidden = false;
    }
  },

  _getChapter(chapterId) {
    return this._load()[chapterId];
  },

  markStepCompleted(chapterId, stepIndex) {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter || !Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= chapter.steps.length) return;
    const data = this._load();
    // Only the current unlocked step (or an earlier one) can be completed.
    if (stepIndex > data[chapterId].stepsCompleted) return;
    data[chapterId].stepsCompleted = Math.max(data[chapterId].stepsCompleted, stepIndex + 1);
    this._save(data);
  },

  getStepProgress(chapterId) {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    return { completed: this._getChapter(chapterId)?.stepsCompleted || 0, total: chapter?.steps.length || 0 };
  },

  isChapterComplete(chapterId) {
    return this.isStepsComplete(chapterId) && this.getQuizInfo(chapterId).passed;
  },

  isStepsComplete(chapterId) {
    const progress = this.getStepProgress(chapterId);
    return progress.total > 0 && progress.completed >= progress.total;
  },

  markQuizPassed(chapterId, score) {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter || !this.isStepsComplete(chapterId) || !Number.isInteger(score) || score < Math.ceil(chapter.quiz.length * 0.6) || score > chapter.quiz.length) return;
    const data = this._load();
    data[chapterId].quizPassed = true;
    data[chapterId].quizBest = Math.max(data[chapterId].quizBest, score);
    this._save(data);
  },

  getQuizInfo(chapterId) {
    const chapter = this._getChapter(chapterId);
    return { passed: chapter?.quizPassed || false, best: chapter?.quizBest || 0 };
  },

  getOverallProgress() {
    return { completed: CHAPTERS.filter(ch => this.isChapterComplete(ch.id)).length, total: CHAPTERS.length };
  },

  getStatus(chapterId) {
    if (this.isChapterComplete(chapterId)) return 'done';
    return this.getStepProgress(chapterId).completed > 0 ? 'in-progress' : 'new';
  },

  resetAll() {
    // Saving an empty object also works when storage is unavailable.
    this._save({});
  }
};
