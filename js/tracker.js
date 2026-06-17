const STORAGE_KEY = 'java-refresher-progress';

const Tracker = {
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  _save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  _getChapter(chapterId) {
    const data = this._load();
    if (!data[chapterId]) {
      data[chapterId] = { stepsCompleted: 0, quizPassed: false, quizBest: 0 };
      this._save(data);
    }
    return data[chapterId];
  },

  markStepCompleted(chapterId, stepIndex) {
    const data = this._load();
    if (!data[chapterId]) {
      data[chapterId] = { stepsCompleted: 0, quizPassed: false, quizBest: 0 };
    }
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    const total = chapter ? chapter.steps.length : 0;
    data[chapterId].stepsCompleted = Math.min(
      Math.max(data[chapterId].stepsCompleted || 0, stepIndex + 1),
      total
    );
    this._save(data);
  },

  getStepProgress(chapterId) {
    const ch = this._getChapter(chapterId);
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    const total = chapter ? chapter.steps.length : 0;
    return { completed: ch.stepsCompleted || 0, total };
  },

  isChapterComplete(chapterId) {
    const ch = this._getChapter(chapterId);
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return false;
    const allStepsDone = (ch.stepsCompleted || 0) >= chapter.steps.length;
    return allStepsDone && ch.quizPassed;
  },

  isStepsComplete(chapterId) {
    const ch = this._getChapter(chapterId);
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return false;
    return (ch.stepsCompleted || 0) >= chapter.steps.length;
  },

  markQuizPassed(chapterId, score) {
    const data = this._load();
    if (!data[chapterId]) {
      data[chapterId] = { stepsCompleted: 0, quizPassed: false, quizBest: 0 };
    }
    data[chapterId].quizPassed = true;
    data[chapterId].quizBest = Math.max(data[chapterId].quizBest || 0, score);
    data[chapterId].stepsCompleted = CHAPTERS.find(c => c.id === chapterId)?.steps.length || 0;
    this._save(data);
  },

  getQuizInfo(chapterId) {
    const ch = this._getChapter(chapterId);
    return { passed: ch.quizPassed, best: ch.quizBest || 0 };
  },

  getOverallProgress() {
    let completed = 0;
    for (const ch of CHAPTERS) {
      if (this.isChapterComplete(ch.id)) completed++;
    }
    return { completed, total: CHAPTERS.length };
  },

  getStatus(chapterId) {
    const ch = this._getChapter(chapterId);
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return 'new';
    if (this.isChapterComplete(chapterId)) return 'done';
    if ((ch.stepsCompleted || 0) > 0 || ch.quizPassed) return 'in-progress';
    return 'new';
  },

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
