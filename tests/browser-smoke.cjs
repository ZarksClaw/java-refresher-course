// Optional end-to-end checks: install Playwright and Chromium first (see README).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!/^(index\.html|js\/[a-z-]+\.js|css\/style\.css)$/.test(relative)) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader('Content-Type', relative.endsWith('.js') ? 'text/javascript' : relative.endsWith('.css') ? 'text/css' : 'text/html');
    response.end(fs.readFileSync(path.join(root, relative)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    assert.equal(await page.locator('.chapter-card').count(), 23);
    await page.locator('#chapter-search').fill('jdbc');
    assert.equal(await page.locator('.chapter-card').count(), 1);
    await page.locator('#chapter-search').fill('no-such-topic');
    assert.equal(await page.locator('.chapter-card').count(), 0);
    await page.locator('#chapter-search').fill('');
    await page.locator('#track-filter').selectOption('Engineering');
    assert.equal(await page.locator('.chapter-card').count(), 12);
    await page.locator('#track-filter').selectOption('');

    const chapters = await page.evaluate(() => CHAPTERS.map(ch => ({ id: ch.id, steps: ch.steps.map(s => ({ type: s.type, correct: s.correct })), quiz: ch.quiz.map(q => q.correct) })));
    for (const chapter of chapters) {
      await page.locator(`[data-chapter="${chapter.id}"]`).click();
      assert.equal(await page.locator('.learning-goals').count(), 1);
      assert.equal(await page.locator('.outline-step[disabled]').count(), chapter.steps.length - 1);
      for (const step of chapter.steps) {
        if (step.type === 'question') {
          assert.equal(await page.locator('#next-btn').isDisabled(), true);
          await page.locator(`.q-option[data-idx="${step.correct}"]`).click();
        }
        await page.locator('#next-btn').click();
      }
      assert.equal(await page.locator('#quiz-view').isVisible(), true);
      if (chapter.id === 12) {
        for (let i = 0; i < chapter.quiz.length; i++) {
          await page.locator(`.q-ops[data-q="${i}"] button`).nth((chapter.quiz[i] + 1) % 4).click();
        }
        await page.locator('#quiz-submit-btn').click();
        assert.match(await page.locator('#quiz-score').innerText(), /^0\//);
        await page.locator('#quiz-retry-btn').click();
      }
      for (let i = 0; i < chapter.quiz.length; i++) {
        await page.locator(`.q-ops[data-q="${i}"] button`).nth(chapter.quiz[i]).click();
      }
      await page.locator('#quiz-submit-btn').click();
      assert.equal(await page.locator('.q-explain.show').count(), chapter.quiz.length);
      await page.locator('#quiz-done-btn').click();
    }
    assert.equal(await page.locator('#overall-label').innerText(), '23 / 23 chapters');
    await page.reload();
    assert.equal(await page.locator('#overall-label').innerText(), '23 / 23 chapters');
    await page.locator('#reset-btn').click();
    await page.locator('#reset-cancel-btn').click();
    assert.equal(await page.locator('#overall-label').innerText(), '23 / 23 chapters');
    await page.locator('#reset-btn').click();
    await page.locator('#reset-confirm-btn').click();
    assert.equal(await page.locator('#overall-label').innerText(), '0 / 23 chapters');
    await page.locator('[data-chapter="1"]').click();
    const firstQuestion = chapters[0].steps.findIndex(step => step.type === 'question');
    for (let i = 0; i < firstQuestion; i++) await page.locator('#next-btn').click();
    assert.equal(await page.locator('.q-option').count(), 4);
    assert.equal(await page.locator('.q-option:disabled').count(), 0, 'reset clears session answers');
    await page.locator('#back-btn').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.locator('[data-chapter="18"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    assert.deepEqual(errors, []);
    console.log('Browser smoke passed: all 23 chapters, quizzes, retry, persistence, reset, search, filters, and mobile width.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
