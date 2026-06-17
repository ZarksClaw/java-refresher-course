const App = {
  _currentChapterId: null,
  _currentStep: 0,

  init() {
    this.showDashboard();
    document.getElementById('back-btn').addEventListener('click', () => this.showDashboard());
    document.getElementById('quiz-back-btn').addEventListener('click', () => this._goBackFromQuiz());
    document.getElementById('prev-btn').addEventListener('click', () => this._prevStep());
    document.getElementById('next-btn').addEventListener('click', () => this._nextStep());
    document.getElementById('reset-btn').addEventListener('click', () => this._confirmReset());
  },

  // ====== DASHBOARD ======

  showDashboard() {
    this._showView('dashboard-view');
    this._renderDashboard();
  },

  _renderDashboard() {
    const grid = document.getElementById('chapter-grid');
    const progress = Tracker.getOverallProgress();
    document.getElementById('overall-fill').style.width = progress.total === 0
      ? '0%'
      : `${(progress.completed / progress.total) * 100}%`;
    document.getElementById('overall-label').textContent = `${progress.completed} / ${progress.total} chapters`;

    let html = '';
    for (const ch of CHAPTERS) {
      const status = Tracker.getStatus(ch.id);
      const stepProg = Tracker.getStepProgress(ch.id);
      const quizInfo = Tracker.getQuizInfo(ch.id);
      const stepPct = stepProg.total === 0 ? 0 : Math.round((stepProg.completed / stepProg.total) * 100);

      let statusText, statusClass, barColor;
      if (status === 'done') {
        statusText = '✅ Completed';
        statusClass = 'done';
        barColor = 'var(--success)';
      } else if (status === 'in-progress') {
        statusText = `🔄 ${stepPct}%`;
        statusClass = 'in-progress';
        barColor = 'var(--primary)';
      } else {
        statusText = '❓ Not Started';
        statusClass = 'new';
        barColor = 'var(--border)';
      }

      html += `
        <div class="chapter-card ${status === 'done' ? 'completed' : ''}" data-chapter="${ch.id}">
          <div class="card-header">
            <div class="card-number">${ch.id}</div>
            <div class="card-title">${ch.title}</div>
          </div>
          <div class="card-desc">${ch.description}</div>
          <div class="card-bar">
            <div class="card-bar-fill" style="width:${stepPct}%;background:${barColor}"></div>
          </div>
          <div class="card-footer">
            <span class="card-status ${statusClass}">${statusText}</span>
            ${quizInfo.passed ? `<span>Quiz: ${quizInfo.best}/${ch.quiz.length}</span>` : `<span>${stepProg.completed}/${stepProg.total} steps</span>`}
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;

    grid.querySelectorAll('.chapter-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.chapter);
        this.showChapter(id);
      });
    });
  },

  // ====== CHAPTER VIEW ======

  showChapter(chapterId) {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    this._currentChapterId = chapterId;

    const progress = Tracker.getStepProgress(chapterId);
    this._currentStep = Math.min(progress.completed, chapter.steps.length - 1);
    if (this._currentStep < 0) this._currentStep = 0;

    this._showView('chapter-view');
    document.getElementById('chapter-title').textContent = `Chapter ${chapter.id}: ${chapter.title}`;
    this._renderStep();
  },

  _renderStep() {
    const chapter = CHAPTERS.find(c => c.id === this._currentChapterId);
    if (!chapter) return;

    const total = chapter.steps.length;
    const step = chapter.steps[this._currentStep];
    const container = document.getElementById('step-content');
    document.getElementById('step-indicator').textContent =
      `Step ${this._currentStep + 1} of ${total}`;

    document.getElementById('prev-btn').disabled = this._currentStep === 0;

    const nextBtn = document.getElementById('next-btn');
    if (step.type === 'question' && !step._answered) {
      nextBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
    }

    if (this._currentStep >= total - 1 && this._isAllStepsDone()) {
      nextBtn.textContent = 'Take Knowledge Check →';
    } else {
      nextBtn.textContent = 'Continue →';
    }

    if (step.type === 'lesson') {
      container.innerHTML = `<div class="lesson-content">${step.content}</div>`;
    } else if (step.type === 'question') {
      this._renderQuestion(step, container);
    }
  },

  _renderQuestion(step, container) {
    const answered = step._answered;
    const chosen = step._chosen;

    let optionsHtml = step.options.map((opt, i) => {
      let cls = 'q-option';
      if (answered) {
        cls += ' disabled';
        if (i === step.correct) cls += ' correct';
        if (i === chosen && chosen !== step.correct) cls += ' wrong';
      }
      return `<button class="${cls}" data-idx="${i}" ${answered ? 'disabled' : ''}>${opt}</button>`;
    }).join('');

    let feedbackHtml = '';
    if (answered) {
      const isCorrect = chosen === step.correct;
      feedbackHtml = `
        <div class="q-feedback ${isCorrect ? 'correct' : 'wrong'}">
          <strong>${isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>
          ${step.explanation}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="question-block">
        <div class="q-text">${step.question}</div>
        <div class="q-options">${optionsHtml}</div>
        ${feedbackHtml}
      </div>
    `;

    if (!answered) {
      container.querySelectorAll('.q-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          step._answered = true;
          step._chosen = idx;
          Tracker.markStepCompleted(this._currentChapterId, this._currentStep);

          const nextBtn = document.getElementById('next-btn');
          nextBtn.disabled = false;

          const chapter = CHAPTERS.find(c => c.id === this._currentChapterId);
          if (this._currentStep >= chapter.steps.length - 1 && this._isAllStepsDone()) {
            nextBtn.textContent = 'Take Knowledge Check →';
          }

          this._renderStep();
        });
      });
    }
  },

  _isAllStepsDone() {
    const chapter = CHAPTERS.find(c => c.id === this._currentChapterId);
    if (!chapter) return false;
    const progress = Tracker.getStepProgress(this._currentChapterId);
    return progress.completed >= chapter.steps.length;
  },

  _nextStep() {
    const chapter = CHAPTERS.find(c => c.id === this._currentChapterId);
    if (!chapter) return;

    const step = chapter.steps[this._currentStep];
    if (step.type === 'lesson') {
      Tracker.markStepCompleted(this._currentChapterId, this._currentStep);
    }

    if (this._currentStep >= chapter.steps.length - 1) {
      if (this._isAllStepsDone()) {
        this._showQuiz(chapter);
      }
      return;
    }

    this._currentStep++;
    this._renderStep();
  },

  _prevStep() {
    if (this._currentStep > 0) {
      this._currentStep--;
      this._renderStep();
    }
  },

  // ====== QUIZ VIEW ======

  _showQuiz(chapter) {
    this._showView('quiz-view');
    Quiz.render(chapter);
  },

  _goBackFromQuiz() {
    if (this._currentChapterId !== null) {
      this.showChapter(this._currentChapterId);
    } else {
      this.showDashboard();
    }
  },

  // ====== UTILITIES ======

  _showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
  },

  _confirmReset() {
    const overlay = document.createElement('div');
    overlay.className = 'reset-overlay';
    overlay.innerHTML = `
      <div class="reset-modal">
        <h3>Reset All Progress?</h3>
        <p>This will clear all completed chapters, quiz scores, and step progress. This cannot be undone.</p>
        <div class="actions">
          <button id="reset-cancel-btn" class="btn btn-ghost">Cancel</button>
          <button id="reset-confirm-btn" class="btn btn-outline" style="border-color:var(--danger);color:var(--danger);">Reset Everything</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#reset-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#reset-confirm-btn').addEventListener('click', () => {
      Tracker.resetAll();
      overlay.remove();
      this.showDashboard();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
