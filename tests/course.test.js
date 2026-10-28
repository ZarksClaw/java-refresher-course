const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function load(saved = {}, unavailable = false) {
  let raw = typeof saved === 'string' ? saved : JSON.stringify(saved);
  const context = vm.createContext({
    localStorage: {
      getItem() { if (unavailable) throw Error('disabled'); return raw; },
      setItem(key, value) { if (unavailable) throw Error('disabled'); raw = value; }
    },
    document: { getElementById() { return null; } }
  });
  for (const file of ['chapters', 'course-content', 'tracker']) {
    vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
  }
  return vm.runInContext('({ CHAPTERS, Tracker })', context);
}

test('curriculum has unique IDs, goals, a lab, valid questions, and meaningful explanations', () => {
  const { CHAPTERS } = load();
  assert.equal(CHAPTERS.length, 23);
  assert.equal(new Set(CHAPTERS.map(ch => ch.id)).size, 23);
  for (const chapter of CHAPTERS) {
    assert.ok(chapter.objectives.length >= 2, chapter.title);
    assert.ok(chapter.steps.some(step => step.content?.includes('<details>')), chapter.title);
    assert.ok(chapter.quiz.length >= 4, chapter.title);
    for (const step of chapter.steps) {
      assert.ok(step.title);
      assert.ok(['lesson', 'question'].includes(step.type));
      if (step.type === 'lesson') assert.ok(step.content.length > 100);
      if (step.example) {
        const rendered = step.content.match(/<pre class="code-block"><code>([\s\S]*?)<\/code><\/pre>/)?.[1];
        assert.ok(rendered, step.title);
        const decoded = rendered.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        assert.equal(decoded, step.example.code, 'compiled code must match the displayed example');
      }
    }
    for (const question of [...chapter.quiz, ...chapter.steps.filter(s => s.type === 'question')]) {
      assert.ok(question.options.length >= 3);
      assert.equal(new Set(question.options).size, question.options.length);
      assert.ok(Number.isInteger(question.correct));
      assert.ok(question.correct >= 0 && question.correct < question.options.length);
      assert.ok(question.explanation.length > 15);
    }
  }
});

test('reviewed Java explanations and annotation assessment remain correct', () => {
  const { CHAPTERS } = load();
  const spring = CHAPTERS[10].steps.find(s => s.question?.includes('@SpringBootApplication'));
  assert.equal(spring.correct, 3);
  assert.ok(spring.explanation.includes('@SpringBootConfiguration'));
  const text = CHAPTERS[2].steps.filter(s => s.content).map(s => s.content).join('');
  assert.ok(text.includes('Comparator.comparingInt'));
  assert.ok(!text.includes('a.age() - b.age()'));
});

test('legacy progress retains completed original steps but invalidates the expanded quiz', () => {
  const { Tracker } = load({ 2: { stepsCompleted: 5, quizPassed: true, quizBest: 3 } });
  assert.equal(Tracker.getStepProgress(2).completed, 5);
  assert.equal(Tracker.getQuizInfo(2).passed, false);
  assert.equal(Tracker.getQuizInfo(2).best, 0);
  assert.equal(Tracker.isChapterComplete(2), false);
  Tracker.markStepCompleted(2, 5);
  assert.equal(Tracker.getStepProgress(2).completed, 6);
});

test('completion requires every lesson and a passing quiz; progress survives reads and reset', () => {
  const { CHAPTERS, Tracker } = load();
  Tracker.markQuizPassed(1, 5);
  assert.equal(Tracker.isChapterComplete(1), false);
  Tracker.markStepCompleted(1, 4);
  assert.equal(Tracker.getStepProgress(1).completed, 0, 'cannot skip locked steps');
  CHAPTERS[0].steps.forEach((_, index) => Tracker.markStepCompleted(1, index));
  Tracker.markQuizPassed(1, 2);
  assert.equal(Tracker.isChapterComplete(1), false);
  Tracker.markQuizPassed(1, 5);
  assert.equal(Tracker.isChapterComplete(1), true);
  Tracker.markQuizPassed(1, 7);
  assert.equal(Tracker.getQuizInfo(1).best, 7);
  assert.equal(Tracker.getOverallProgress().completed, 1);
  Tracker.resetAll();
  assert.equal(Tracker.getStepProgress(1).completed, 0);
  assert.equal(Tracker.getOverallProgress().completed, 0);
});

test('malformed stored data and invalid counters are bounded', () => {
  for (const input of ['null', '[]', '{bad', {1:{revision:2, stepsCompleted:-4, quizBest:999}}, {1:{stepsCompleted:'100'} }]) {
    const { Tracker } = load(input);
    assert.equal(Tracker.getStepProgress(1).completed, 0);
  }
  const { Tracker, CHAPTERS } = load({1:{revision:2, stepsCompleted:999, quizBest:999}});
  assert.equal(Tracker.getStepProgress(1).completed, CHAPTERS[0].steps.length);
  assert.equal(Tracker.getQuizInfo(1).best, CHAPTERS[0].quiz.length);
});

test('disabled storage preserves session progress and can reset it', () => {
  const { Tracker } = load({}, true);
  Tracker.markStepCompleted(1, 0);
  assert.equal(Tracker.storageAvailable, false);
  assert.equal(Tracker.getStepProgress(1).completed, 1);
  Tracker.markStepCompleted(1, 1);
  assert.equal(Tracker.getStepProgress(1).completed, 2);
  Tracker.resetAll();
  assert.equal(Tracker.getStepProgress(1).completed, 0);
});
