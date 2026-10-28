# Java Refresher Course

An interactive refresher with **23 chapters, 181 learning steps, 125 quiz questions,
and 23 practice labs with worked solutions**. It starts with core Java and moves
into testing, JVM diagnostics, HTTP, JDBC, virtual threads, delivery, and a runnable
expense-report capstone.

The browser application has no build step, third-party dependencies, remote fonts,
or network requirements. Open `index.html`, or serve the repository:

```bash
python3 -m http.server 8080
```

Visit http://localhost:8080. The browser displays examples; it does **not** compile
or execute Java. Use a **JDK 21+**, including `javac`, for the local exercises. All
runnable additions compile against `--release 21` and use no preview flags. This is
a deliberate baseline, not a claim that Java 21 is the latest Java release.

## Learning path

1. Search by chapter title, topic, or goal; filter Foundations or Engineering.
2. Read the goals and examples, then predict the quick-check answers.
3. Write and run each practice lab before expanding the worked solution.
4. Use the lesson outline to revisit unlocked steps.
5. Complete the knowledge check: at least 60% is required. Explanations appear
   after submission, and quizzes can be retried even after passing.
6. Build the capstone and choose a stretch goal.

Allow about 30 minutes per Foundations chapter and 40 per Engineering chapter,
plus additional practice and project time. These are estimates, not timers. You
can begin any chapter from the dashboard; later steps unlock within that chapter.
Labs are self-assessed, so a quiz pass does not certify that code was written or run.

Progress is stored in the browser for that origin. A different browser, hostname,
or port has separate progress. Upgrading from the original course retains original
lesson positions, but expanded quizzes must be passed again. Reset clears saved
progress and session answers. If storage is blocked, progress works for the current
session and the application displays a notice.

## Foundations

| # | Chapter | Expanded material |
|---|---------|-------------------|
| 1 | Java Fundamentals | Pass-by-value, aliasing, final references, overflow, unboxing, Unicode |
| 2 | Object-Oriented Programming | Composition, stable value keys, constructor invariants |
| 3 | Collections Framework | Views vs snapshots, fixed-size lists, safe comparison, actual operation costs |
| 4 | Generics | Invariance, PECS, erasure limits, Supplier factories |
| 5 | Exception Handling | Causes vs suppressed errors, cleanup, interruption |
| 6 | I/O & NIO | Resource-owning streams, UTF-8, bounded reads, path semantics |
| 7 | Lambda Expressions | Capture vs mutation, composition, primitive specializations |
| 8 | Streams API | Collection mutability contracts, duplicate keys, lazy fallbacks |
| 9 | Concurrency | Atomic updates, resource ownership, queue limits, completion stages |
| 10 | Modern Java (9–21) | Record patterns, exhaustive switch, sequenced collections, previews |
| 11 | Spring Boot Basics | Stateless services, validation, transaction proxies, actuator exposure |

## Engineering

| # | Chapter | Practical outcome |
|---|---------|-------------------|
| 12 | JVM, Memory & Modules | Understand bytecode, JIT, reachability, resource cleanup, JPMS, and diagnostics |
| 13 | Records, Immutability & Domain Models | Enforce invariants and ownership with records and sealed variants |
| 14 | Dates, Time Zones & Exact Money | Choose temporal types, inject Clock, and use BigDecimal precisely |
| 15 | Testing & Testable Design | Test boundaries, use fakes, and understand optional JUnit integration |
| 16 | Maven, Builds & Delivery Workflows | Separate source, tests, dependency management, verification, and publishing |
| 17 | Logging, Debugging & Observability | Read evidence and add useful, bounded operational signals |
| 18 | HTTP Clients & API Boundaries | Configure HttpClient, validate statuses/payloads, and define retry limits |
| 19 | JDBC & Transaction Boundaries | Bind SQL values, own resources, and define commit/rollback behavior |
| 20 | Virtual Threads & Bounded Concurrency | Scale waiting-heavy work without overwhelming downstream resources |
| 21 | Application Design & Service Boundaries | Isolate domain rules and reason about idempotency and external effects |
| 22 | Performance & Secure Coding | Profile honestly, bound input, avoid unsafe deserialization and shell parsing |
| 23 | Capstone: Expense Report CLI | Combine records, BigDecimal, NIO, validation, and a tested CLI |

## Running the snippets

Most new code blocks are **method bodies**, not complete source files. Add the
imports used by the example and a main wrapper. For example:

```java
import java.util.ArrayList;
import java.util.List;

public class Example {
    public static void main(String[] args) throws Exception {
        var names = new ArrayList<>(List.of("Ada"));
        names.add("Grace");
        assert names.size() == 2;
    }
}
```

```bash
javac --release 21 Example.java
java -ea Example
```

`-ea` enables Java assertions in teaching examples. **Do not use assert for input
validation**: it may be disabled. Worked solutions containing `static` helper
methods and a `main` method belong directly inside the Example class, rather than
inside another main. Imports come from the packages used: java.util, java.util.stream,
java.util.function, java.util.concurrent, java.util.concurrent.atomic, java.math,
java.time, java.nio.file, java.nio.charset, java.io, java.net, and java.net.http.

Integration/configuration blocks are labeled explicitly. They are teaching
patterns, not standalone applications:

- Spring lessons use a **Spring Boot 3.x Servlet/Jakarta baseline** for terminology;
  they are not a complete Spring project and are not a claim about current support
  status. A real project needs compatible dependencies, configuration, and tests.
- JUnit Jupiter is optional and needs a compatible dependency and test runner.
- JDBC needs a real driver, schema, and DataSource; the JDK supplies the API.
- HttpClient transport sketches need a real trusted endpoint. The offline checks
  construct requests but never make public-network calls.
- Maven/XML/module snippets require the project structure described around them.

## Runnable capstone

[Expense report project](examples/expense-report/README.md) includes full source,
input contract, sample data, and a dependency-free behavioral harness:

```bash
javac --release 21 -d examples/expense-report/out examples/expense-report/*.java
java -cp examples/expense-report/out ExpenseReport examples/expense-report/sample.tsv
java -cp examples/expense-report/out ExpenseReportTest
```

Expected sample output:

```text
books: 19.75
travel: 20.00
```

The input is a deliberately constrained tab-separated format, not general CSV.
Invalid records fail before totals are printed. The test harness uses explicit
checks that remain active even without `-ea`.

## Development checks

Viewing the browser course needs neither Node nor a JDK. Maintainer checks require
**Node.js 22+ and JDK 21+**. Set JAVA_HOME to the JDK if java/javac on PATH disagree.

```bash
node --test tests/*.test.js
javac --release 21 -d examples/expense-report/out examples/expense-report/*.java
java -cp examples/expense-report/out ExpenseReportTest
```

Checks validate curriculum shape, learning goals, question indexes, progression,
legacy migration, storage fallback, and reset. New runnable snippets and lab
solutions are compiled together against Java 21, then executed individually with
assertions enabled in a temporary directory. Integration sketches and original
introductory fragments are not represented as standalone runnable programs.

Optional browser checks use Playwright as a development-only dependency:

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser-smoke.cjs
```

The browser suite traverses every chapter and quiz, fails/retries a quiz, reloads
saved progress, resets session answers, searches, filters, and checks mobile width.
GitHub Actions runs validation and browser jobs on pushes and pull requests.

## Maintaining the course

- `js/chapters.js`: original chapters with review corrections.
- `js/course-content.js`: deeper lessons, labs, objectives, new chapters, and runnable
  example metadata. Shared helpers escape Java code before rendering.
- `js/app.js`, `js/quiz.js`, `js/tracker.js`: UI, assessment, and revision-aware progress.
- `tests/`: curriculum/progress checks, compiled examples, and browser smoke tests.
- `docs/course-review.md`: findings, changes, and verification boundaries.

Keep stable chapter IDs and append lessons to preserve saved positions. Increment
a chapter revision when assessment requirements change. Reordering original steps
requires an explicit migration. Repository-authored lesson HTML is trusted content,
not a mechanism for rendering arbitrary user HTML.

## Primary references

- [Java 21 language guide](https://docs.oracle.com/en/java/javase/21/language/)
- [Java 21 API](https://docs.oracle.com/en/java/javase/21/docs/api/)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
- [Maven lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Spring Framework transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring Boot annotation API](https://docs.spring.io/spring-boot/3.5/api/java/org/springframework/boot/autoconfigure/SpringBootApplication.html)
