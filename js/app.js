const App = {
  _currentChapterId: null,
  _currentStep: 0,

  init() {
    this.showDashboard();
    document.getElementById('chapter-search').addEventListener('input', () => this._renderDashboard());
    document.getElementById('track-filter').addEventListener('change', () => this._renderDashboard());
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

    const query = document.getElementById('chapter-search').value.trim().toLowerCase();
    const track = document.getElementById('track-filter').value;
    const chapters = CHAPTERS.filter(ch => (!track || ch.track === track) &&
      [ch.title, ch.description, ...ch.objectives].join(' ').toLowerCase().includes(query));
    document.getElementById('course-stats').textContent = `${CHAPTERS.length} chapters · ${CHAPTERS.reduce((sum, ch) => sum + ch.steps.length, 0)} learning steps · ${CHAPTERS.reduce((sum, ch) => sum + ch.quiz.length, 0)} quiz questions · offline-friendly`;
    document.getElementById('search-status').textContent = `${chapters.length} chapters shown`;
    let html = '';
    for (const ch of chapters) {
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
        <button type="button" class="chapter-card ${status === 'done' ? 'completed' : ''}" data-chapter="${ch.id}">
          <span class="card-header">
            <span class="card-number">${ch.id}</span>
            <span class="card-title">${ch.title}</span>
          </span>
          <span class="card-meta">${ch.track} · About ${ch.estimatedMinutes} min</span>
          <span class="card-desc">${ch.description}</span>
          <span class="card-bar">
            <span class="card-bar-fill" style="width:${stepPct}%;background:${barColor}"></span>
          </span>
          <span class="card-footer">
            <span class="card-status ${statusClass}">${statusText}</span>
            ${quizInfo.passed ? `<span>Quiz: ${quizInfo.best}/${ch.quiz.length}</span>` : `<span>${stepProg.completed}/${stepProg.total} steps</span>`}
          </span>
        </button>
      `;
    }
    grid.innerHTML = html || '<p>No chapters match. Try a different topic or track.</p>';

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

    nextBtn.textContent = this._currentStep === total - 1
      ? 'Take Knowledge Check →' : 'Continue →';

    this._renderOutline(chapter);
    if (step.type === 'lesson') {
      const goals = this._currentStep === 0 ? `<aside class="learning-goals"><h3>Learning goals</h3><ul>${chapter.objectives.map(goal => `<li>${goal}</li>`).join('')}</ul></aside>` : '';
      const reference = chapter.reference ? `<p class="reference">Read more: <a href="${chapter.reference[1]}" target="_blank" rel="noopener noreferrer">${chapter.reference[0]}</a></p>` : '';
      container.innerHTML = `${goals}<div class="lesson-content">${step.content}${reference}</div>`;
    } else if (step.type === 'question') {
      this._renderQuestion(step, container);
    }
  },

  _renderOutline(chapter) {
    const completed = Tracker.getStepProgress(chapter.id).completed;
    const outline = document.getElementById('lesson-outline');
    outline.innerHTML = chapter.steps.map((step, index) => {
      const disabled = index > completed;
      return `<button class="outline-step" data-step="${index}" ${disabled ? 'disabled' : ''} ${index === this._currentStep ? 'aria-current="step"' : ''}>${index + 1}. ${step.title}</button>`;
    }).join('');
    outline.querySelectorAll('button:not(:disabled)').forEach(button => {
      button.addEventListener('click', () => {
        this._currentStep = Number(button.dataset.step);
        this._renderStep();
        document.getElementById('step-content').focus();
      });
    });
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
    document.getElementById('step-content').focus();
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
      CHAPTERS.forEach(chapter => chapter.steps.forEach(step => {
        delete step._answered;
        delete step._chosen;
      }));
      overlay.remove();
      this.showDashboard();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
