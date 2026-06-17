const Quiz = {
  _answers: [],
  _submitted: false,

  render(chapter) {
    this._answers = [];
    this._submitted = false;

    const quizQuestions = chapter.quiz || [];
    const container = document.getElementById('quiz-content');
    const scoreEl = document.getElementById('quiz-score');
    document.getElementById('quiz-title').textContent = `Knowledge Check: ${chapter.title}`;
    scoreEl.textContent = '';

    if (quizQuestions.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:2rem;">No quiz questions for this chapter.</p>`;
      return;
    }

    let html = '';
    quizQuestions.forEach((q, i) => {
      html += `
        <div class="quiz-question" data-q="${i}">
          <div class="q-num">Question ${i + 1} of ${quizQuestions.length}</div>
          <div class="q-text">${q.question}</div>
          <div class="q-ops" data-q="${i}">
            ${q.options.map((opt, j) => `
              <button data-q="${i}" data-opt="${j}">${opt}</button>
            `).join('')}
          </div>
          <div class="q-explain" data-q="${i}">${q.explanation}</div>
        </div>
      `;
    });
    html += `
      <div style="text-align:center;margin-top:1.5rem;">
        <button id="quiz-submit-btn" class="btn btn-primary">Submit Answers</button>
      </div>
    `;
    container.innerHTML = html;

    container.querySelectorAll('.q-ops button').forEach(btn => {
      btn.addEventListener('click', () => this._selectAnswer(btn));
    });
    document.getElementById('quiz-submit-btn').addEventListener('click', () => this._submit(chapter));
  },

  _selectAnswer(btn) {
    if (this._submitted) return;
    const qIdx = parseInt(btn.dataset.q);
    const optIdx = parseInt(btn.dataset.opt);
    this._answers[qIdx] = optIdx;

    const parent = btn.closest('.q-ops');
    parent.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  _submit(chapter) {
    const quizQuestions = chapter.quiz || [];
    let allAnswered = true;

    quizQuestions.forEach((q, i) => {
      if (this._answers[i] === undefined) allAnswered = false;
    });

    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    this._submitted = true;
    let correct = 0;

    quizQuestions.forEach((q, i) => {
      const chosen = this._answers[i];
      const isCorrect = chosen === q.correct;
      if (isCorrect) correct++;

      const btns = document.querySelectorAll(`.q-ops[data-q="${i}"] button`);
      btns.forEach((btn, j) => {
        btn.disabled = true;
        if (j === q.correct) btn.classList.add('correct');
        if (j === chosen && !isCorrect) btn.classList.add('wrong');
      });

      const explain = document.querySelector(`.q-explain[data-q="${i}"]`);
      if (explain) explain.classList.add('show');
    });

    const total = quizQuestions.length;
    const passed = correct >= Math.ceil(total * 0.6);
    const scoreEl = document.getElementById('quiz-score');

    const percent = Math.round((correct / total) * 100);
    scoreEl.textContent = `${correct}/${total} (${percent}%)`;

    const submitBtn = document.getElementById('quiz-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    if (passed) {
      Tracker.markQuizPassed(chapter.id, correct);
    }

    const resultHtml = `
      <div style="text-align:center;margin-top:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;">
        <div style="font-size:3rem;margin-bottom:.5rem;">${passed ? '🎉' : '😅'}</div>
        <h3>${passed ? 'Congratulations!' : 'Keep Practicing!'}</h3>
        <p>You scored <span class="result-score ${passed ? 'pass' : 'fail'}">${correct}/${total}</span></p>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">${passed ? 'You passed the knowledge check!' : 'You need ' + (Math.ceil(total * 0.6) - correct) + ' more correct to pass.'}</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;">
          ${passed ? `<button id="quiz-done-btn" class="btn btn-primary">Back to Dashboard</button>` : `<button id="quiz-retry-btn" class="btn btn-primary">Retry Quiz</button>`}
        </div>
      </div>
    `;
    const container = document.getElementById('quiz-content');
    container.insertAdjacentHTML('beforeend', resultHtml);

    const doneBtn = document.getElementById('quiz-done-btn');
    if (doneBtn) doneBtn.addEventListener('click', () => App.showDashboard());

    const retryBtn = document.getElementById('quiz-retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => {
      Tracker._getChapter(chapter.id);
      Quiz.render(chapter);
    });
  }
};
