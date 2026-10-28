const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('js/chapters.js', 'utf8') + fs.readFileSync('js/course-content.js', 'utf8') + ';globalThis.chapters = CHAPTERS', context);
const examples = context.chapters.flatMap(chapter => chapter.steps.filter(step => step.example).map(step => ({ ...step.example, title: `${chapter.id}: ${step.title}` })));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'java-course-'));
const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const javac = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'javac') : 'javac';
const imports = `import java.util.*;
import java.util.stream.*;
import java.util.function.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.math.*;
import java.time.*;
import java.nio.file.*;
import java.nio.charset.*;
import java.io.*;
import java.net.*;
import java.net.http.*;`;

before(() => {
  const files = examples.map((example, index) => {
    example.name = `Example${index}`;
    const body = example.mode === 'members' ? example.code : `public static void main(String[] args) throws Exception {\n${example.code}\n}`;
    const file = path.join(directory, `${example.name}.java`);
    fs.writeFileSync(file, `${imports}\npublic class ${example.name} {\n${body}\n}\n`);
    return file;
  });
  const result = spawnSync(javac, ['--release', '21', '-encoding', 'UTF-8', '-d', directory, ...files], { encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, `JDK 21+ with javac is required.\n${result.stderr || result.error?.message}`);
});
after(() => fs.rmSync(directory, { recursive: true, force: true }));
for (const example of examples) {
  test(`Compiled Java example: ${example.title}`, () => {
    const result = spawnSync(java, ['-ea', '-cp', directory, example.name], { cwd: directory, encoding: 'utf8', timeout: 15000 });
    assert.equal(result.status, 0, result.stderr || result.error?.message || result.stdout);
  });
}
