// Java 21 curriculum. Runnable snippets carry metadata used by tests/examples.test.js.
(() => {
  const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lesson = (title, text, code, takeaway, mode = 'body') => ({
    type: 'lesson', title,
    content: `<h3>${title}</h3><p>${text}</p>${code ? `<pre class="code-block"><code>${escape(code)}</code></pre>` : ''}<p class="takeaway"><strong>Remember:</strong> ${takeaway}</p>${mode === 'reference' ? '<p><em>Integration/configuration example: requires the project or dependencies described above; not a standalone program.</em></p>' : ''}`,
    ...(code && mode !== 'reference' ? { example: { code, mode } } : {})
  });
  const lab = (task, code, explanation, mode = 'body') => ({
    type: 'lesson', title: 'Practice lab',
    content: `<h3>Practice lab</h3><p>${task}</p><p>Write and run your answer locally before opening the solution. Try a normal case, an empty input, and an invalid input where applicable. Examples use Java 21 without preview features. Most snippets are method bodies; imports and a main wrapper are documented in the README.</p><details><summary>Show worked solution</summary><pre class="code-block"><code>${escape(code)}</code></pre><p>${explanation}</p></details>`,
    example: { code, mode }
  });
  const q = (question, options, correct, explanation) => ({ question, options, correct, explanation });
  const foundations = [
    {
      id: 1, objectives: ['Explain pass-by-value and reference aliasing.', 'Handle numeric overflow, unboxing, and Unicode boundaries.'],
      lessons: [
        lesson('Java always passes values', 'A method receives a copy of an argument value. For a reference type, the copied value is a reference, so mutating the referenced object may be visible to the caller. Reassigning the parameter cannot replace the caller’s variable. A final reference prevents rebinding; it does not freeze the object.', String.raw`var original = new ArrayList<>(List.of("Ada"));
var alias = original;
alias.add("Grace");
assert original.size() == 2;
final var fixed = original;
fixed.add("Linus"); // legal: mutating the list, not rebinding fixed
assert original.size() == 3;`, 'Use defensive copies at ownership boundaries instead of assuming final means immutable.'),
        lesson('Numeric and text edge cases', 'Integer arithmetic can overflow silently; use Math.addExact when overflow is a domain error. Unboxing null throws NullPointerException. A char is a UTF-16 code unit, so some characters occupy two char values. String length counts code units, not user-perceived characters.', String.raw`assert Integer.MAX_VALUE + 1 == Integer.MIN_VALUE;
try {
    Math.addExact(Integer.MAX_VALUE, 1);
    throw new AssertionError("overflow should fail");
} catch (ArithmeticException expected) { }
String smile = "\uD83D\uDE00";
assert smile.length() == 2;
assert smile.codePointCount(0, smile.length()) == 1;
Integer count = null;
assert Objects.requireNonNullElse(count, 0) == 0;`, 'Use BigDecimal from text for exact money. Use equals for value equality and == for reference identity.')
      ],
      lab: lab('Demonstrate that a method can append to a caller’s list but cannot replace the caller’s reference by reassigning its parameter.', String.raw`static void modify(List<String> values) {
    values.add("added");
    values = new ArrayList<>(List.of("replacement"));
}
public static void main(String[] args) {
    var values = new ArrayList<>(List.of("original"));
    modify(values);
    assert values.equals(List.of("original", "added"));
}`, 'The parameter receives a copied reference. Rebinding that local parameter does not change the caller’s variable.', 'members'),
      questions: [q('What does Java pass to a method for an object argument?', ['The object itself by reference', 'A copy of the reference value', 'A deep copy', 'A pointer to the caller’s variable'], 1, 'All Java arguments are passed by value; a reference value is copied.'), q('Does final List prevent list.add?', ['Always', 'No; final prevents reassignment of the reference', 'Only for strings', 'Only on Java 21'], 1, 'Mutability of the object and reassignment of the variable are different properties.')]
    },
    {
      id: 2, objectives: ['Design substitutable interfaces and explicit ownership.', 'Apply equals/hashCode and constructor invariants.'],
      lessons: [
        lesson('Composition and substitutability', 'An interface describes behavior a caller needs. Composition connects collaborators without forcing an inheritance hierarchy. Prefer a small interface that can be implemented by a real adapter or an in-memory fake. Overriding dispatches instance methods; static methods are hidden, not overridden.', String.raw`interface Writer { void write(String value); }
var messages = new ArrayList<String>();
Writer writer = messages::add;
writer.write("processed 3");
assert messages.equals(List.of("processed 3"));`, 'Inheritance should preserve a supertype’s behavioral promises, not merely reuse a few lines of code.'),
        lesson('Value equality and stable keys', 'For value objects, equals and hashCode must agree. If fields used by these methods change while a key is stored, lookups may fail. Records generate component-based equality and hashing, but mutable components still require care. Validate invariants at construction rather than leaving invalid objects partially usable.', String.raw`record UserId(String value) {
    UserId {
        Objects.requireNonNull(value, "value");
        if (value.isBlank()) throw new IllegalArgumentException("blank id");
    }
}
var users = new HashMap<UserId, String>();
users.put(new UserId("42"), "Ada");
assert users.get(new UserId("42")).equals("Ada");`, 'Do not expose mutable internal state through getters. Return a copy or a deliberately documented view.')
      ],
      lab: lab('Create a record representing a positive quantity. Reject zero and negative values, and verify value equality.', String.raw`record Quantity(int value) {
    Quantity {
        if (value <= 0) throw new IllegalArgumentException("quantity must be positive");
    }
}
assert new Quantity(2).equals(new Quantity(2));
try {
    new Quantity(0);
    throw new AssertionError("zero should fail");
} catch (IllegalArgumentException expected) { }`, 'A compact constructor checks the inputs before generated field assignment.'),
      questions: [q('What can go wrong with a mutable HashMap key?', ['It becomes a primitive', 'Changing equality/hash fields can break lookup', 'It is copied automatically', 'Nothing'], 1, 'The key can remain in a bucket inconsistent with its new hash value.'), q('Which best supports substituting a collaborator in a unit test?', ['A hidden global singleton', 'An explicit constructor dependency with a small interface', 'Private reflection', 'Static mutable fields'], 1, 'Explicit dependencies allow deterministic fake implementations.')]
    },
    {
      id: 3, objectives: ['Distinguish unmodifiable views from snapshots.', 'Choose collections and comparators using actual costs.'],
      lessons: [
        lesson('Views, copies, and shallow immutability', 'Collections.unmodifiableList wraps a live backing list. List.copyOf takes an unmodifiable snapshot of its elements; it rejects null elements. Neither deeply freezes mutable elements. Arrays.asList has a fixed size and is backed by the array: set works, but add and remove do not.', String.raw`var source = new ArrayList<>(List.of("a"));
var view = Collections.unmodifiableList(source);
var snapshot = List.copyOf(source);
source.add("b");
assert view.size() == 2;
assert snapshot.size() == 1;
String[] array = {"x", "y"};
var fixed = Arrays.asList(array);
fixed.set(0, "z");
assert array[0].equals("z");`, 'Choose whether a caller should observe future changes. An unmodifiable view and an independent snapshot have different contracts.'),
        lesson('Costs, ordering, and safe comparison', 'ArrayList offers constant-time indexed access and amortized append. LinkedList must traverse to find an arbitrary index, so middle insertion is not automatically fast. ArrayDeque is usually a better queue/stack starting point than legacy Stack. Avoid comparator subtraction because overflow can reverse ordering.', String.raw`record Person(String name, int age) { }
var people = new ArrayList<>(List.of(new Person("B", Integer.MAX_VALUE), new Person("A", -1)));
people.sort(Comparator.comparingInt(Person::age).thenComparing(Person::name));
assert people.getFirst().name().equals("A");
var queue = new ArrayDeque<String>();
queue.addLast("first");
queue.addLast("second");
assert queue.removeFirst().equals("first");`, 'A sorted set uses comparison equality to decide duplicates. Ensure that matches your domain’s equals semantics.')
      ],
      lab: lab('Count words case-insensitively while preserving the order in which distinct words first appeared.', String.raw`var counts = new LinkedHashMap<String, Integer>();
for (String word : List.of("Java", "java", "Streams")) {
    counts.merge(word.toLowerCase(Locale.ROOT), 1, Integer::sum);
}
assert counts.get("java") == 2;
assert new ArrayList<>(counts.keySet()).equals(List.of("java", "streams"));`, 'LinkedHashMap provides deterministic insertion order; Locale.ROOT avoids a machine-specific case mapping policy.'),
      questions: [q('Which reflects later structural changes in its backing list?', ['List.copyOf', 'Collections.unmodifiableList', 'A serialized copy', 'List.of with different values'], 1, 'An unmodifiable wrapper is a live view, not a snapshot.'), q('Why avoid a.age() - b.age() as a comparator?', ['It cannot compile', 'Integer overflow can violate ordering', 'It is always too slow', 'It mutates ages'], 1, 'Use Integer.compare or Comparator.comparingInt to avoid subtraction overflow.')]
    },
    {
      id: 4, objectives: ['Apply invariance and PECS correctly.', 'Recognize erasure limits and safe generic factories.'],
      lessons: [
        lesson('Invariance and flexible APIs', 'List&lt;Integer&gt; is not a subtype of List&lt;Number&gt;. Otherwise a caller could insert a Double into an Integer list. Use extends when reading a producer and super when writing a consumer. An extends view still allows operations such as clear if the underlying collection supports mutation; it is not an immutable view.', String.raw`static <T> void copyValues(List<? extends T> source, List<? super T> destination) {
    for (T value : source) destination.add(value);
}
public static void main(String[] args) {
    List<Integer> source = List.of(1, 2);
    List<Number> destination = new ArrayList<>();
    copyValues(source, destination);
    assert destination.equals(List.of(1, 2));
}`, 'Wildcards express how a method uses its inputs, not whether the underlying object is mutable.', 'members'),
        lesson('Erasure, metadata, and factories', 'Generic type arguments do not become reified runtime element checks. Reflection can still inspect declared generic signatures in some contexts. Avoid raw types and unchecked casts. If creation is required, pass a Supplier rather than attempting new T(). Arrays and generic collections have different runtime type behavior.', String.raw`static <T> List<T> createMany(int count, Supplier<T> factory) {
    if (count < 0) throw new IllegalArgumentException("negative count");
    var result = new ArrayList<T>();
    for (int i = 0; i < count; i++) result.add(factory.get());
    return result;
}
public static void main(String[] args) {
    var builders = createMany(2, StringBuilder::new);
    builders.get(0).append("first");
    assert builders.get(1).isEmpty();
}`, 'A factory must create independent instances if callers expect independent state.', 'members')
      ],
      lab: lab('Write a generic first method that returns Optional.empty for an empty list. Reject null elements by contract.', String.raw`static <T> Optional<T> first(List<T> values) {
    return values.isEmpty() ? Optional.empty() : Optional.of(values.getFirst());
}
public static void main(String[] args) {
    assert first(List.of("Ada")).orElseThrow().equals("Ada");
    assert first(List.<Integer>of()).isEmpty();
}`, 'The generic method preserves its element type. Optional.of rejects null instead of silently treating it as absence.', 'members'),
      questions: [q('Is List&lt;Integer&gt; assignable to List&lt;Number&gt;?', ['Yes', 'No; generics are invariant', 'Only with final', 'Only after erasure'], 1, 'Invariance prevents inserting an incompatible Number into an Integer list.'), q('What should an API accept to create values of T?', ['new T()', 'A Supplier&lt;T&gt;', 'A raw Object only', 'A cast from int'], 1, 'A factory carries an executable construction strategy without relying on erased type arguments.')]
    },
    {
      id: 5, objectives: ['Preserve primary failures and causes.', 'Close resources and cooperate with interruption.'],
      lessons: [
        lesson('Suppressed failures and causes', 'Try-with-resources closes in reverse declaration order. If the body throws and close also throws, the body failure stays primary and the close failure is suppressed. Exception translation should preserve the original cause. Avoid returning in finally because it can replace the result or suppress a failure.', String.raw`class Resource implements AutoCloseable {
    public void close() { throw new IllegalStateException("close failed"); }
}
try (var resource = new Resource()) {
    throw new IllegalArgumentException("body failed");
} catch (IllegalArgumentException error) {
    assert error.getMessage().equals("body failed");
    assert error.getSuppressed().length == 1;
}`, 'A cause explains why an error happened; suppressed exceptions record additional failures during cleanup.'),
        lesson('Interruption is a cancellation signal', 'Blocking APIs may throw InterruptedException and clear the interrupted flag. Propagate it when your method can. If your boundary cannot propagate, usually restore the flag and stop the operation. Do not turn interruption into successful work or an unbounded retry.', String.raw`var executor = Executors.newSingleThreadExecutor();
try {
    var result = executor.submit(() -> 42);
    assert result.get(1, TimeUnit.SECONDS) == 42;
} catch (InterruptedException error) {
    Thread.currentThread().interrupt();
    throw new IllegalStateException("interrupted", error);
} finally {
    executor.shutdownNow();
}`, 'shutdownNow requests interruption; it does not forcibly kill arbitrary running code.')
      ],
      lab: lab('Translate a NumberFormatException into a domain-facing IllegalArgumentException while retaining the cause and rejecting nonpositive ports.', String.raw`static int parsePort(String text) {
    final int port;
    try { port = Integer.parseInt(text); }
    catch (NumberFormatException error) {
        throw new IllegalArgumentException("port must be an integer", error);
    }
    if (port < 1 || port > 65535) throw new IllegalArgumentException("port out of range");
    return port;
}
public static void main(String[] args) {
    assert parsePort("8080") == 8080;
    try { parsePort("bad"); throw new AssertionError(); }
    catch (IllegalArgumentException error) { assert error.getCause() instanceof NumberFormatException; }
}`, 'Keep the try block narrow so the translated error refers to parsing, not unrelated work.', 'members'),
      questions: [q('When body and close both throw, where is the close failure recorded?', ['It replaces the body error', 'In getSuppressed() on the body error', 'Only in a log', 'It is always discarded'], 1, 'Try-with-resources preserves the body error and attaches cleanup failures as suppressed exceptions.'), q('What is usually appropriate when InterruptedException cannot be propagated?', ['Ignore it', 'Restore the flag and stop or fail the operation', 'Retry forever', 'Catch Error instead'], 1, 'Restoring interruption preserves cancellation information for the enclosing caller.')]
    },
    {
      id: 6, objectives: ['Close resource-owning streams.', 'Choose explicit encodings and bounded file operations.'],
      lessons: [
        lesson('Filesystem streams own resources', 'Files.lines, Files.walk, and Files.list return streams that must be closed. Most collection streams do not own external resources. Use try-with-resources, choose UTF-8 explicitly at data boundaries, and avoid readAllLines for huge files. A Path describes a location; it does not imply the file exists.', String.raw`Path file = Files.createTempFile("course-", ".txt");
try {
    Files.writeString(file, "first\n\nsecond\n", StandardCharsets.UTF_8);
    try (var lines = Files.lines(file, StandardCharsets.UTF_8)) {
        assert lines.filter(line -> !line.isBlank()).count() == 2;
    }
} finally { Files.deleteIfExists(file); }`, 'Closing the stream releases its underlying file resources even if the terminal operation fails.'),
        lesson('Encoding, writing, and replacement', 'Bytes need an agreed encoding to become text. A default charset may vary by runtime configuration and older Java releases, so specify the format at a boundary. For a durable write, write to a temporary sibling and move into place; ATOMIC_MOVE is filesystem-dependent and may be unsupported. Do not claim atomic replacement is always portable.', String.raw`String text = "café";
byte[] encoded = text.getBytes(StandardCharsets.UTF_8);
assert encoded.length == 5;
assert new String(encoded, StandardCharsets.UTF_8).equals(text);
Path root = Path.of("reports");
assert root.resolve("daily.txt").equals(Path.of("reports", "daily.txt"));`, 'Use a proper CSV/JSON parser for general formats. Splitting on delimiters is valid only for an explicitly constrained format.')
      ],
      lab: lab('Count nonblank UTF-8 lines from a temporary file and ensure it is deleted after processing.', String.raw`Path file = Files.createTempFile("lines-", ".txt");
try {
    Files.writeString(file, "one\n \ntwo\n", StandardCharsets.UTF_8);
    long count;
    try (var lines = Files.lines(file, StandardCharsets.UTF_8)) {
        count = lines.filter(line -> !line.isBlank()).count();
    }
    assert count == 2;
} finally { Files.deleteIfExists(file); }`, 'The file stream is closed before deletion, which also makes the example portable to systems that restrict deleting open files.'),
      questions: [q('Which stream must be explicitly closed?', ['List.of(1).stream()', 'Files.lines(path)', 'Stream.of(1, 2)', 'IntStream.range(0, 2)'], 1, 'Files.lines owns an open file resource.'), q('Does Path.of("missing.txt") create the file?', ['Yes', 'No; it creates a path representation', 'Only in main', 'Only with var'], 1, 'Filesystem effects require an operation such as Files.writeString or createFile.')]
    },
    {
      id: 7, objectives: ['Separate variable capture from object mutation.', 'Compose functions and inject deterministic dependencies.'],
      lessons: [
        lesson('Capture is not deep immutability', 'A captured local variable must be final or effectively final, but the object it references may still be mutable. Mutating shared objects from callbacks can create races or surprising ordering. Prefer transformations that return values, and use primitive functional interfaces to avoid boxing where it matters.', String.raw`var captured = new ArrayList<String>();
Consumer<String> add = captured::add;
add.accept("Ada");
assert captured.equals(List.of("Ada"));
IntUnaryOperator twice = value -> value * 2;
assert twice.applyAsInt(4) == 8;`, 'A bound method reference such as System.out::println targets an existing receiver; String::trim uses the function argument as receiver.'),
        lesson('Composition and dependency injection', 'Functions are useful collaborators. Function.andThen applies the current function first and the next one second. compose applies the supplied function first. A Supplier can inject a clock or external operation without hidden global state. Keep checked-exception contracts explicit when adapting I/O.', String.raw`Function<String, String> trim = String::strip;
Function<String, Integer> length = String::length;
assert trim.andThen(length).apply(" Ada ") == 3;
Supplier<Instant> clock = () -> Instant.parse("2025-01-01T00:00:00Z");
assert clock.get().equals(Instant.parse("2025-01-01T00:00:00Z"));`, 'Do not wrap every checked exception in a generic RuntimeException simply to force it through a lambda.')
      ],
      lab: lab('Compose a whitespace normalizer with a locale-independent uppercase transformation. Verify the input is not changed.', String.raw`Function<String, String> trim = String::strip;
Function<String, String> upper = value -> value.toUpperCase(Locale.ROOT);
var normalize = trim.andThen(upper);
String original = " Java ";
assert normalize.apply(original).equals("JAVA");
assert original.equals(" Java ");`, 'Locale.ROOT expresses a stable non-user-specific casing policy.'),
      questions: [q('Can a lambda append to an effectively final ArrayList reference?', ['No', 'Yes; it does not reassign the captured variable', 'Only if static', 'Only with reflection'], 1, 'The capture restriction concerns rebinding, not mutation of the referenced object.'), q('Which runs first in f.andThen(g)?', ['g', 'f', 'Both concurrently', 'Neither until compile time'], 1, 'andThen applies f and feeds its result to g.')]
    },
    {
      id: 8, objectives: ['Use stream reductions without hidden side effects.', 'Handle duplicate keys and lazy Optional fallbacks.'],
      lessons: [
        lesson('Collectors and mutability contracts', 'Stream.toList returns an unmodifiable list. Collectors.toList makes no guarantee about the returned list’s mutability or concrete type; use toCollection(ArrayList::new) for an explicit mutable result. toMap rejects duplicate keys unless a merge function is provided. A reduction must use an associative operation and a correct identity for parallel use.', String.raw`var values = Stream.of("a", "bb", "c").collect(Collectors.toCollection(ArrayList::new));
values.add("ddd");
var counts = values.stream().collect(Collectors.toMap(String::length, value -> 1, Integer::sum));
assert counts.get(1) == 2;
assert values.size() == 4;`, 'Do not use peek or map for required side effects: optimization and short-circuiting may skip work.'),
        lesson('Optional and parallelism with clear costs', 'Optional is usually a return type describing absence, not a replacement for every null field. orElse evaluates its argument eagerly; orElseGet invokes a supplier only when empty. Parallel streams need stateless work and enough computational cost to justify coordination. Blocking I/O on a shared common pool can interfere with unrelated work.', String.raw`var calls = new AtomicInteger();
Optional<String> name = Optional.of("Ada");
assert name.orElseGet(() -> { calls.incrementAndGet(); return "fallback"; }).equals("Ada");
assert calls.get() == 0;
var flattened = Stream.of(List.of(1, 2), List.of(3)).flatMap(List::stream).toList();
assert flattened.equals(List.of(1, 2, 3));`, 'A stream is a one-shot computation pipeline, not a reusable collection. Create a new stream for another traversal.')
      ],
      lab: lab('Group nonblank words by length, ignoring surrounding whitespace. Keep the implementation free of shared mutable side effects.', String.raw`var grouped = Stream.of(" a ", "bb", "", " c ")
    .map(String::strip)
    .filter(value -> !value.isEmpty())
    .collect(Collectors.groupingBy(String::length));
assert grouped.get(1).equals(List.of("a", "c"));
assert grouped.get(2).equals(List.of("bb"));`, 'collect manages its accumulation; avoid appending to an external list from forEach, especially in parallel.'),
      questions: [q('What does Stream.toList guarantee about mutation?', ['It supports add', 'It returns an unmodifiable list', 'It returns LinkedList', 'It deep-copies elements'], 1, 'Stream.toList is unmodifiable, but elements can still be mutable.'), q('What happens with duplicate keys in toMap without a merge function?', ['Last wins', 'First wins', 'IllegalStateException', 'Keys disappear'], 2, 'An explicit merge function is required when collisions are legitimate.')]
    },
    {
      id: 9, objectives: ['Coordinate compound operations and observe failures.', 'Bound work and distinguish shutdown from termination.'],
      lessons: [
        lesson('Atomic updates and safe publication', 'volatile establishes visibility and ordering guarantees, but count++ is still a read-modify-write sequence. Use an atomic operation or a lock for an invariant. A concurrent collection makes its documented operations safe; composing get and put is not automatically atomic. Use merge, compute, or putIfAbsent where appropriate.', String.raw`var counts = new ConcurrentHashMap<String, Integer>();
try (var pool = Executors.newFixedThreadPool(4)) {
    var tasks = new ArrayList<Future<?>>();
    for (int i = 0; i < 100; i++) tasks.add(pool.submit(() -> counts.merge("done", 1, Integer::sum)));
    for (var task : tasks) task.get();
}
assert counts.get("done") == 100;`, 'This course uses Java 21, where ExecutorService supports try-with-resources. Observe submitted task failures through their futures.'),
        lesson('Bound queues, timeouts, and completion stages', 'A fixed pool limits workers but its convenience factory uses an unbounded queue. At a service boundary, define admission limits and rejection behavior. Future.get(timeout) limits the caller’s wait, not the task’s entire lifetime. thenCompose flattens dependent async work; thenCombine combines independent results.', String.raw`var first = CompletableFuture.completedFuture(2);
var second = first.thenCompose(value -> CompletableFuture.completedFuture(value * 3));
assert second.join() == 6;
assert first.thenCombine(CompletableFuture.completedFuture(4), Integer::sum).join() == 6;`, 'Cancellation is cooperative. A timed-out CompletableFuture does not necessarily interrupt or stop its underlying operation.')
      ],
      lab: lab('Use a fixed pool to calculate squares, collect results in input order, and close the pool. Allow exceptions to propagate rather than returning fake success.', String.raw`try (var pool = Executors.newFixedThreadPool(2)) {
    List<Callable<Integer>> tasks = List.of(() -> 1 * 1, () -> 2 * 2, () -> 3 * 3);
    var futures = pool.invokeAll(tasks);
    var results = new ArrayList<Integer>();
    for (var future : futures) results.add(future.get());
    assert results.equals(List.of(1, 4, 9));
}`, 'invokeAll returns futures in task order; completion order may differ. Production code should define deadlines and cancellation policy.'),
      questions: [q('Does volatile int make count++ atomic?', ['Yes', 'No', 'Only with final', 'Only on Java 21'], 1, 'Volatile does not combine the read, increment, and write into one atomic operation.'), q('What does thenCompose avoid?', ['All exceptions', 'Nested CompletableFuture results', 'All blocking I/O', 'Every thread'], 1, 'It flattens a function returning a completion stage into the resulting stage.')]
    },
    {
      id: 10, objectives: ['Use final Java 21 features without preview flags.', 'Understand records, pattern scope, and switch exhaustiveness.'],
      lessons: [
        lesson('Record patterns and exhaustive switches', 'Java 21 finalizes record patterns and pattern matching for switch. A sealed hierarchy can make valid variants explicit, allowing the compiler to check an exhaustive switch. Handle null deliberately: a default branch does not automatically match null. Records hold final references but are only shallowly immutable.', String.raw`record Point(int x, int y) { }
Object value = new Point(2, 3);
int total = switch (value) {
    case Point(int x, int y) -> x + y;
    case null -> 0;
    default -> -1;
};
assert total == 5;`, 'Arrow rules do not fall through. A switch expression may throw rather than return a value on some paths.'),
        lesson('Sequenced collections and version discipline', 'Java 21 adds sequenced collection interfaces for encounter-ordered operations such as getFirst, getLast, and reversed views. A reversed view is backed by its source, not a detached copy. This course excludes preview features; StructuredTaskScope is preview in Java 21, while virtual threads are final.', String.raw`var names = new ArrayList<>(List.of("Ada", "Grace"));
var reverse = names.reversed();
assert reverse.getFirst().equals("Grace");
names.add("Linus");
assert reverse.getFirst().equals("Linus");
var snapshot = List.copyOf(reverse);
names.clear();
assert snapshot.equals(List.of("Linus", "Grace", "Ada"));`, 'Declare the compilation baseline with --release 21. A newer JDK alone does not make newer APIs safe for older deployment targets.')
      ],
      lab: lab('Use an exhaustive switch expression over an enum, with one block using yield. Verify all enum values.', String.raw`enum Priority { LOW, NORMAL, HIGH }
for (Priority priority : Priority.values()) {
    int delay = switch (priority) {
        case LOW -> 10;
        case NORMAL -> 5;
        case HIGH -> { yield 0; }
    };
    assert delay >= 0;
}`, 'An enum switch can be exhaustive without default. If the enum gains a constant, recompilation identifies missing cases.'),
      questions: [q('Is StructuredTaskScope a final Java 21 API?', ['Yes', 'No; it is preview in Java 21', 'It is a Spring bean', 'It was removed in Java 8'], 1, 'Do not confuse Java 21 final virtual threads with its preview structured concurrency API.'), q('Does List.reversed() necessarily make a copy?', ['Yes', 'No; it returns a reversed view', 'Only for int', 'Only for records'], 1, 'The reversed view reflects changes in its backing list.')]
    },
    {
      id: 11, objectives: ['Separate framework boundaries from domain logic.', 'Understand bean scope, validation, and transaction proxies.'],
      lessons: [
        lesson('Bean lifetime and explicit dependencies', 'A default singleton bean is one instance per application context, not necessarily one globally. Concurrent requests can invoke it, so avoid storing per-request state in mutable fields. Constructor injection makes dependencies required and testable, but does not make all referenced objects immutable. Keep domain logic usable without starting Spring.', String.raw`interface TaxPolicy { BigDecimal apply(BigDecimal amount); }
TaxPolicy policy = amount -> amount.multiply(new BigDecimal("1.10"));
assert policy.apply(new BigDecimal("10.00")).compareTo(new BigDecimal("11.00")) == 0;`, 'The example models a domain collaborator without framework annotations. Its behavior can be tested without a container.'),
        lesson('Validation, transactions, and exposure', 'For a Spring Boot 3.x Servlet project, use jakarta.validation constraints on request DTOs and @Valid at the controller boundary; include the validation starter. Bind typed configuration with explicit registration. In default proxy-based transaction management, self-invocation does not pass through the proxy, so @Transactional on an internally called method may not apply. Runtime exceptions roll back by default; checked-exception rules need explicit policy.', String.raw`// Integration sketch; requires Spring Boot 3.x and validation dependencies.
// DTO:
record CreateUser(@jakarta.validation.constraints.NotBlank String name) { }
// In a controller method:
// ResponseEntity<UserDto> create(@Valid @RequestBody CreateUser request)
// In a service invoked through its Spring proxy:
// @Transactional(rollbackFor = IOException.class)
// public void importUsers(...) throws IOException { ... }`, 'Actuator availability and web exposure are separate settings. Expose only the endpoints you intend and secure management access.', 'reference')
      ],
      lab: lab('Model a service with a constructor-injected repository using plain Java. Test it with an in-memory lambda without starting Spring.', String.raw`interface UserRepository { Optional<String> findName(long id); }
class UserService {
    private final UserRepository repository;
    UserService(UserRepository repository) { this.repository = Objects.requireNonNull(repository); }
    String name(long id) { return repository.findName(id).orElse("Unknown"); }
}
UserRepository fake = id -> id == 1 ? Optional.of("Ada") : Optional.empty();
var service = new UserService(fake);
assert service.name(1).equals("Ada");
assert service.name(2).equals("Unknown");`, 'The same service can be wired by Spring; the behavior does not depend on annotations or a running server.'),
      questions: [q('Does a singleton Spring bean automatically make mutable fields thread-safe?', ['Yes', 'No', 'Only with @Service', 'Only with constructor injection'], 1, 'Bean scope controls instance lifetime, not concurrent access to mutable state.'), q('With default proxy-based transactions, does this.someTransactionalMethod() cross the proxy?', ['Always', 'No; self-invocation bypasses it', 'Only for checked exceptions', 'Only on GET requests'], 1, 'A call must enter through the transactional proxy for its advice to apply.')]
    }
  ];
  for (const addition of foundations) {
    const chapter = CHAPTERS.find(ch => ch.id === addition.id);
    chapter.objectives = addition.objectives;
    chapter.steps.push(...addition.lessons, addition.lab);
    chapter.quiz.push(...addition.questions);
  }
  const engineering = [
    {
      title: 'JVM, Memory & Modules', description: 'Bytecode, JIT, garbage collection, classpaths, and JPMS boundaries',
      objectives: ['Distinguish reachability from resource cleanup.', 'Diagnose runtime and dependency boundaries.'],
      lessons: [
        lesson('From source to running code', 'javac compiles source to bytecode. The JVM loads classes, verifies code, and may interpret or JIT-compile frequently executed paths. --release selects language/API compatibility as well as bytecode target. A JRE can run code, but a JDK supplies javac and diagnostic tools. Classpath ordering can hide conflicting versions; a dependency tree helps locate them.', String.raw`// Run in a terminal with a JDK 21 installation:
// java -version
// javac -version
// javac --release 21 -d out Example.java
// java -ea -cp out Example
assert Runtime.version().feature() >= 21;`, 'Compile and test against the deployment baseline. Newer compilation without --release can accidentally bind to unavailable APIs.'),
        lesson('Reachability, garbage collection, and leaks', 'The collector reclaims unreachable objects; it does not close sockets or files deterministically. Memory leaks happen when unwanted objects remain reachable through static maps, listeners, thread locals, or unbounded caches. Cycles alone are not a leak in a tracing collector. Heap pressure and native memory are different diagnostic domains.', String.raw`var cache = new HashMap<String, byte[]>();
cache.put("temporary", new byte[1024]);
assert cache.size() == 1;
cache.clear(); // removes this map’s strong references
assert cache.isEmpty();
// System.gc() is only a request, not a reliable test or cleanup strategy.`, 'Use try-with-resources for resource lifetime and measured retention policies for caches. Do not rely on finalization.'),
        lesson('Modules and diagnostic tools', 'JPMS uses module-info.java to declare dependencies and exported packages. exports enables ordinary access to public APIs; opens permits deep reflection by designated consumers. Prefer narrow opens when a framework needs reflection. Use jcmd for thread and JVM diagnostics and JFR for measured runtime events; diagnostic output can contain sensitive data.', String.raw`// module-info.java: illustrative configuration, not a main program.
module course.tools {
    requires java.net.http;
    exports course.api;
    // opens course.model to a.named.framework.module;
}
// Terminal examples: jcmd <pid> Thread.print
// jcmd <pid> JFR.start duration=30s filename=recording.jfr`, 'A package being public is not sufficient across named modules unless its module exports it. Avoid blanket --add-opens as a default design.', 'reference')
      ],
      lab: lab('Return an independent unmodifiable snapshot of a cache’s keys so later cache changes cannot alter the returned value.', String.raw`var cache = new HashMap<String, Integer>();
cache.put("a", 1);
var keys = Set.copyOf(cache.keySet());
cache.put("b", 2);
assert keys.equals(Set.of("a"));`, 'keySet is a live view; copying makes the ownership contract explicit. Garbage collection cannot decide when a cached value is no longer useful to your application.'),
      questions: [q('Will garbage collection reliably close a file when your method finishes?', ['Yes', 'No; use explicit resource management', 'Only for static files', 'Only with System.gc'], 1, 'Reachability-based memory reclamation does not define deterministic file lifetime.'), q('What does --release 21 constrain?', ['Only formatting', 'Language features, target bytecode, and documented platform APIs', 'The operating system', 'Only heap size'], 1, 'It helps prevent accidental use of APIs from a newer compilation JDK.'), q('Can a static unbounded map cause a memory leak?', ['No', 'Yes; unused values can remain reachable', 'Only for primitives', 'Only with a cycle'], 1, 'A leak can be retained reachable data that is no longer useful.'), q('What does opens primarily enable in JPMS?', ['Deep reflective access', 'A network port', 'Public inheritance only', 'Automatic dependency downloads'], 0, 'opens controls reflective access; exports controls ordinary API access.')],
      reference: ['JDK 21 tools', 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/index.html']
    },
    {
      title: 'Records, Immutability & Domain Models', description: 'Defensive copying, sealed variants, value semantics, and invariants',
      objectives: ['Design immutable values with safe component ownership.', 'Represent valid domain states explicitly.'],
      lessons: [
        lesson('A record is not a deep freeze', 'Record components are final references. A record holding an ArrayList can still observe changes to that list unless the constructor copies it. Copy a collection into an unmodifiable representation to protect structural ownership, then also consider whether each element is immutable. Records with arrays have reference-based array equality unless you implement a deliberate alternative.', String.raw`record Team(String name, List<String> members) {
    Team {
        Objects.requireNonNull(name);
        members = List.copyOf(members);
    }
}
var input = new ArrayList<>(List.of("Ada"));
var team = new Team("review", input);
input.add("Grace");
assert team.members().equals(List.of("Ada"));`, 'A defensive shallow copy is sufficient here because String elements are immutable; mutable element types need their own ownership policy.'),
        lesson('Make invalid construction fail early', 'A compact constructor validates parameters before generated assignment. Avoid silently normalizing values when callers need to know the input was invalid. Value equality should match the business meaning. BigDecimal.equals includes scale, so 1.0 and 1.00 are not equal even though compareTo reports numeric equality.', String.raw`record Money(BigDecimal amount, Currency currency) {
    Money {
        Objects.requireNonNull(amount);
        Objects.requireNonNull(currency);
        if (amount.signum() < 0) throw new IllegalArgumentException("negative amount");
        amount = amount.setScale(2, RoundingMode.UNNECESSARY);
    }
}
var usd = Currency.getInstance("USD");
assert new Money(new BigDecimal("1.0"), usd).equals(new Money(new BigDecimal("1.00"), usd));`, 'This two-decimal model is a deliberately limited currency contract. Not every currency uses two decimal places.'),
        lesson('Sealed variants and exhaustive behavior', 'A sealed interface lists the supported variants. Pair it with records for immutable messages and an exhaustive pattern switch for behavior. This is useful when variants are a closed domain, while an ordinary interface is better when external implementations must remain open.', String.raw`// Class members, followed by main. Java 21, no preview features.
sealed interface Result permits Success, Failure { }
record Success(String value) implements Result { }
record Failure(String reason) implements Result { }
static String describe(Result result) {
    return switch (result) {
        case Success(String value) -> "ok: " + value;
        case Failure(String reason) -> "error: " + reason;
    };
}
public static void main(String[] args) {
    assert describe(new Success("saved")).equals("ok: saved");
}`, 'Null is outside this result contract. Validate it at the boundary rather than assuming default matches null.', 'members')
      ],
      lab: lab('Create a ShoppingList record that rejects a blank owner and snapshots its list of item names.', String.raw`record ShoppingList(String owner, List<String> items) {
    ShoppingList {
        if (owner == null || owner.isBlank()) throw new IllegalArgumentException("owner required");
        items = List.copyOf(items);
    }
}
var items = new ArrayList<>(List.of("book"));
var shopping = new ShoppingList("Ada", items);
items.clear();
assert shopping.items().equals(List.of("book"));`, 'List.copyOf also rejects null elements. It does not validate domain-specific rules such as blank item names; add those if the contract requires them.'),
      questions: [q('What does a final record component guarantee?', ['Deep immutability', 'Its reference cannot be reassigned after initialization', 'Its elements cannot change', 'Automatic thread locking'], 1, 'The referenced object may still be mutable.'), q('Why copy a caller-supplied mutable collection?', ['To sort it automatically', 'To prevent later external mutation from changing owned state', 'To create threads', 'To erase types'], 1, 'A defensive copy establishes an ownership boundary.'), q('Which compares BigDecimal numerical value while ignoring scale?', ['==', 'compareTo', 'hashCode', 'toString'], 1, 'compareTo returns zero for numerically equal values such as 1.0 and 1.00.'), q('What enables an exhaustive switch over a closed hierarchy?', ['volatile', 'A sealed interface with known variants', 'A raw List', 'An unbounded wildcard'], 1, 'The compiler knows the permitted subclasses.')],
      reference: ['records', 'https://docs.oracle.com/en/java/javase/21/language/records.html']
    },
    {
      title: 'Dates, Time Zones & Exact Money', description: 'Instant, LocalDate, ZonedDateTime, Clock, Duration, and BigDecimal',
      objectives: ['Choose temporal types by meaning.', 'Keep financial arithmetic exact and rounding explicit.'],
      lessons: [
        lesson('A timestamp and a calendar date are different', 'Instant identifies a point on the global timeline. LocalDate is a date without time or zone, useful for birthdays or report dates. LocalDateTime is not a globally unique timestamp. ZonedDateTime combines local time with regional rules. Persist a timestamp and the domain’s zone policy rather than guessing the server’s default zone.', String.raw`Instant instant = Instant.parse("2025-01-15T18:00:00Z");
ZonedDateTime chicago = instant.atZone(ZoneId.of("America/Chicago"));
assert chicago.getHour() == 12;
assert chicago.toInstant().equals(instant);
assert LocalDate.parse("2025-01-15").plusDays(1).equals(LocalDate.of(2025, 1, 16));`, 'A numeric UTC offset is not a full set of regional daylight-saving rules.'),
        lesson('Calendar periods and elapsed durations', 'A day on a regional calendar need not be exactly 24 elapsed hours around daylight saving transitions. Period models date-based amounts; Duration models seconds and nanoseconds. Inject Clock for deterministic business-time tests. Use System.nanoTime differences for elapsed performance measurements rather than wall-clock timestamps.', String.raw`Clock fixed = Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
assert Instant.now(fixed).equals(Instant.parse("2025-01-01T00:00:00Z"));
var start = ZonedDateTime.of(2025, 3, 8, 12, 0, 0, 0, ZoneId.of("America/Chicago"));
var tomorrow = start.plusDays(1);
assert Duration.between(start.toInstant(), tomorrow.toInstant()).toHours() == 23;`, 'For schedules in a zone, define how to handle ambiguous or nonexistent local times instead of assuming every local time maps uniquely.'),
        lesson('Decimal construction and rounding policy', 'new BigDecimal(double) captures the binary floating-point approximation. Construct from text for an exact decimal input. Divide with an explicit scale or MathContext when the quotient may repeat. Choose rounding at a business boundary, not independently after every operation.', String.raw`BigDecimal price = new BigDecimal("19.99");
BigDecimal total = price.multiply(new BigDecimal("1.0825")).setScale(2, RoundingMode.HALF_UP);
assert total.equals(new BigDecimal("21.64"));
assert new BigDecimal("1").divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP).equals(new BigDecimal("0.33"));`, 'Document currency, bounds, precision, and rounding. Formatting a double to two places does not make the underlying arithmetic exact.')
      ],
      lab: lab('Calculate days until a deadline using an injected UTC Clock. Verify a fixed test date without sleeping.', String.raw`static long daysUntil(LocalDate deadline, Clock clock) {
    return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(clock), deadline);
}
public static void main(String[] args) {
    Clock clock = Clock.fixed(Instant.parse("2025-01-01T12:00:00Z"), ZoneOffset.UTC);
    assert daysUntil(LocalDate.of(2025, 1, 3), clock) == 2;
    assert daysUntil(LocalDate.of(2024, 12, 31), clock) == -1;
}`, 'The caller supplies the zone through the clock. A negative result has an explicit meaning: the deadline is in the past.', 'members'),
      questions: [q('Which type directly represents a global timestamp?', ['LocalDate', 'LocalDateTime', 'Instant', 'Period'], 2, 'Instant identifies a point on the timeline independent of a display zone.'), q('Is plusDays(1) always a 24-hour elapsed change in a regional zone?', ['Yes', 'No; daylight saving can change elapsed time', 'Only in UTC strings', 'Only for leap years'], 1, 'Calendar arithmetic follows the zone’s local-day rules.'), q('What makes current-time business logic testable?', ['Thread.sleep', 'An injected Clock', 'System default zone everywhere', 'A static mutable date'], 1, 'Clock.fixed supplies a deterministic instant and zone.'), q('Which preserves the literal decimal price exactly?', ['new BigDecimal(0.1)', 'new BigDecimal("0.10")', 'double price = 0.1', 'Math.round(0.1)'], 1, 'Constructing from text preserves the intended decimal input.')],
      reference: ['java.time', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/package-summary.html']
    },
    {
      title: 'Testing & Testable Design', description: 'Assertions, JUnit Jupiter, boundary cases, fakes, and integration tests',
      objectives: ['Test observable contracts and failure cases.', 'Separate fast unit tests from resource integration.'],
      lessons: [
        lesson('Tests must make a failure observable', 'A good test arranges input, performs an operation, and checks its outcome. Include boundaries and invalid input. Java assert statements are disabled unless -ea is used; they are appropriate for these dependency-free teaching examples but not user-input validation. JUnit Jupiter provides assertions that run independently of the JVM assertion flag.', String.raw`static int requirePositive(int value) {
    if (value <= 0) throw new IllegalArgumentException("positive value required");
    return value;
}
public static void main(String[] args) {
    assert requirePositive(1) == 1;
    try { requirePositive(0); throw new AssertionError("expected failure"); }
    catch (IllegalArgumentException expected) { }
}`, 'Tests should fail when a meaningful behavior regresses, not merely repeat implementation details.', 'members'),
        lesson('Jupiter tests and dependency boundaries', 'JUnit Jupiter uses @Test, assertions, and extension APIs. Parameterized tests cover one rule with multiple inputs. A build needs a compatible Jupiter test dependency and test runner configuration; the course shows this as optional integration rather than silently assuming JUnit is part of the JDK.', String.raw`// Optional JUnit Jupiter example, not part of the offline standard-library checks.
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class QuantityTest {
    @Test void rejectsZero() {
        assertThrows(IllegalArgumentException.class, () -> new Quantity(0));
    }
}
// Quantity must be supplied by your project. See the OOP chapter.`, 'Use your build’s dependency management and current compatible JUnit engine/runner versions; annotations alone do not execute tests.', 'reference'),
        lesson('Fakes, clocks, and integration tests', 'Inject external effects to make unit tests deterministic. A fake repository or a fixed clock is often clearer than many interaction mocks. Integration tests use real boundaries such as a database or filesystem with isolated resources. Avoid public-network dependencies and arbitrary sleeps in the unit suite.', String.raw`interface NameLookup { Optional<String> find(long id); }
NameLookup fake = id -> id == 7 ? Optional.of("Ada") : Optional.empty();
assert fake.find(7).orElseThrow().equals("Ada");
assert fake.find(8).isEmpty();
Clock clock = Clock.fixed(Instant.EPOCH, ZoneOffset.UTC);
assert Instant.now(clock).equals(Instant.EPOCH);`, 'Coverage reports execution, not correctness. Verify both successful behavior and the expected failure type.')
      ],
      lab: lab('Write a dependency-free behavioral check for a parseCount function. Cover zero, a normal count, a negative count, and noninteger text.', String.raw`static int parseCount(String text) {
    int value = Integer.parseInt(text);
    if (value < 0) throw new IllegalArgumentException("negative count");
    return value;
}
public static void main(String[] args) {
    assert parseCount("0") == 0;
    assert parseCount("12") == 12;
    for (String bad : List.of("-1", "abc")) {
        try { parseCount(bad); throw new AssertionError("accepted " + bad); }
        catch (IllegalArgumentException expected) { }
    }
}`, 'NumberFormatException is an IllegalArgumentException subclass. If callers need different categories, specify and test them separately.', 'members'),
      questions: [q('Are Java assert statements enabled by default?', ['Yes', 'No; use -ea', 'Only in main', 'Only for records'], 1, 'The provided snippet runner explicitly enables assertions.'), q('Which unit-test dependency is most predictable?', ['The live network', 'A deterministic fake', 'The current time', 'Random sleeps'], 1, 'A fake controls the external behavior without nondeterministic I/O.'), q('What does 100% line coverage prove?', ['All behavior is correct', 'Those lines executed, not that assertions were sufficient', 'No race exists', 'Every input was tested'], 1, 'Coverage is evidence of execution, not a correctness proof.'), q('Where should invalid user input be rejected?', ['Only in assert', 'In explicit runtime validation', 'Only in Javadoc', 'Never'], 1, 'Runtime validation must remain active even when assertions are disabled.')],
      reference: ['JUnit documentation', 'https://junit.org/junit5/docs/current/user-guide/']
    },
    {
      title: 'Maven, Builds & Delivery Workflows', description: 'Project layout, compiler release, dependency scopes, tests, and artifacts',
      objectives: ['Make compilation and dependencies reproducible.', 'Distinguish development checks from publishing artifacts.'],
      lessons: [
        lesson('A conventional project layout', 'Maven’s default Java layout separates main code, resources, tests, and generated outputs. The browser course itself does not require Maven. For a Java project, commit source and build configuration, ignore target, and use a wrapper when a team needs a controlled Maven version. Gradle has different tasks and configuration but the same need for explicit toolchains and dependency boundaries.', String.raw`example-project/
  pom.xml
  src/main/java/com/example/App.java
  src/main/resources/application.properties
  src/test/java/com/example/AppTest.java
  target/   # generated, do not commit`, 'Keep package declarations aligned with source directories and avoid relying on an IDE-only classpath.', 'reference'),
        lesson('Pin tools and declare the release target', 'Configure a recent compatible compiler plugin and release 21 so code is checked against the deployment API. Scope test libraries to tests. Dependency management can centralize versions, but it does not automatically add every managed dependency. Inspect dependency convergence when multiple paths bring different versions.', String.raw`<!-- pom.xml fragments; supply a full Maven project and plugin version policy. -->
<properties>
  <maven.compiler.release>21</maven.compiler.release>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
<!-- Pin compatible compiler and test runner plugin versions in your build.
     A Spring Boot parent/BOM supplies its own managed version set. -->`, 'A Java runtime version, compiler release target, and third-party library compatibility are separate constraints.', 'reference'),
        lesson('Understand lifecycle commands', 'test compiles and executes configured tests; package creates an artifact; verify runs additional verification bound to that lifecycle. install writes to the local Maven repository, while deploy publishes to a remote repository and requires deliberate release configuration. Do not publish from a learning check. A plain JAR does not automatically bundle all dependencies or become a Boot executable JAR.', String.raw`# Terminal commands for an existing Maven project:
./mvnw test
./mvnw verify
./mvnw dependency:tree
# Offline capstone in this repository uses javac directly instead.
# Never run deploy as a test command.`, 'Inspect the actual test count. A successful build with zero discovered tests is not evidence that your tests ran.', 'reference')
      ],
      lab: lab('Verify your runtime baseline from a program and fail clearly when the feature version is below 21. Then compare java -version and javac -version in the terminal.', String.raw`int feature = Runtime.version().feature();
if (feature < 21) throw new IllegalStateException("JDK 21+ required, found " + feature);
assert feature >= 21;`, 'This checks the running runtime. Compile-time --release remains necessary; runtime checks do not prevent accidentally linking to newer APIs.'),
      questions: [q('Which Maven phase builds an artifact without publishing remotely?', ['deploy', 'package', 'release everything', 'clean only'], 1, 'package creates the artifact; deploy publishes it to a remote repository.'), q('What does dependency management do?', ['Adds every dependency automatically', 'Supplies managed versions/configuration for declared dependencies', 'Replaces javac', 'Runs all tests'], 1, 'Dependencies still need to be declared or brought in transitively.'), q('Why configure maven.compiler.release?', ['To select a port', 'To constrain the Java language/API/bytecode target', 'To publish to GitHub', 'To install Maven'], 1, 'It helps align compilation with deployment compatibility.'), q('What should you verify after configuring a test runner?', ['Only BUILD SUCCESS', 'The expected tests were discovered and executed', 'Only target exists', 'Only the IDE compiles'], 1, 'A build can succeed while running no tests if discovery is misconfigured.')],
      reference: ['Maven lifecycle', 'https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html']
    },
    {
      title: 'Logging, Debugging & Observability', description: 'Stack traces, structured context, log levels, JFR, and thread dumps',
      objectives: ['Diagnose failures from evidence.', 'Add useful signals without leaking sensitive data.'],
      lessons: [
        lesson('Read the failure before guessing', 'Start with a minimal reproduction, the exception type, and the stack frame nearest your code. Follow causes and suppressed exceptions. A debugger lets you inspect state and step through assumptions; a thread dump reveals blocked/waiting stacks, while a heap analysis investigates retained objects. Use the tool that answers the specific question.', String.raw`try {
    Integer.parseInt("not-a-number");
    throw new AssertionError();
} catch (NumberFormatException error) {
    assert error.getStackTrace().length > 0;
    assert error.getMessage() != null;
}`, 'After a fix, add a regression test reproducing the original input rather than relying only on an interactive debugging session.'),
        lesson('Log context once at the right boundary', 'Libraries should use loggers without configuring the application’s global output. The JDK System.Logger API keeps this example dependency-free; many applications use SLF4J with a selected backend. Include stable operation names and correlation identifiers, not credentials, session tokens, or full sensitive payloads. Avoid logging the same exception at every layer.', String.raw`System.Logger logger = System.getLogger("course.import");
int records = 12;
logger.log(System.Logger.Level.INFO, "Import finished: records={0}", records);
// At an error boundary: logger.log(System.Logger.Level.ERROR, "Import failed", error);`, 'Parameterized logging supports deferred formatting, but expensive argument expressions are still evaluated before the call.'),
        lesson('Metrics and traces complement logs', 'A log records an event, a metric summarizes numeric behavior over time, and a trace connects spans across an operation. Avoid high-cardinality metric tags such as user IDs or unique request IDs. Measure elapsed time with nanoTime differences. JFR can reveal allocations, stalls, and thread activity without adding print statements to every hot path.', String.raw`long start = System.nanoTime();
long total = java.util.stream.LongStream.rangeClosed(1, 1000).sum();
long elapsedNanos = System.nanoTime() - start;
assert total == 500500;
assert elapsedNanos >= 0;`, 'A tiny one-off elapsed measurement is not a benchmark. Use representative profiling and JMH for reliable microbenchmark comparisons.')
      ],
      lab: lab('Preserve a parsing cause when adding an operation-specific error message, then inspect both layers in a test.', String.raw`static int readBatchSize(String text) {
    try { return Integer.parseInt(text); }
    catch (NumberFormatException error) {
        throw new IllegalArgumentException("invalid batch size", error);
    }
}
public static void main(String[] args) {
    try { readBatchSize("bad"); throw new AssertionError(); }
    catch (IllegalArgumentException error) {
        assert error.getMessage().equals("invalid batch size");
        assert error.getCause() instanceof NumberFormatException;
    }
}`, 'The domain message supplies context while the original cause preserves the technical diagnosis.', 'members'),
      questions: [q('Which diagnostic best starts a blocked-thread investigation?', ['Only a dependency tree', 'A thread dump', 'An HTML validator', 'A new database'], 1, 'Thread dumps reveal waiting and blocked execution stacks.'), q('Which is a poor metric tag?', ['Operation name', 'Unique request ID', 'Known status category', 'A bounded region code'], 1, 'Unbounded cardinality can overwhelm metric storage and aggregation.'), q('Which should usually be excluded from logs?', ['Record count', 'Operation name', 'Authentication tokens', 'Elapsed duration'], 2, 'Credentials and tokens must not leak into diagnostic output.'), q('Which clock is appropriate for elapsed timing?', ['LocalDate.now', 'System.nanoTime differences', 'A formatted timestamp', 'A timezone offset'], 1, 'nanoTime is intended for elapsed differences, not wall-clock dates.')],
      reference: ['JFR tools', 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/jfr.html']
    },
    {
      title: 'HTTP Clients & API Boundaries', description: 'HttpClient, timeouts, status handling, bounded bodies, and retry policy',
      objectives: ['Build bounded HTTP calls and validate responses.', 'Separate transport success from domain validity.'],
      lessons: [
        lesson('Reuse a client and define time budgets', 'Java’s standard HttpClient supports synchronous and asynchronous requests. Reuse clients rather than constructing one per request. Set connect and request timeouts, keep TLS verification enabled, and decide redirect policy. The code below builds a request without making a network call.', String.raw`try (var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).followRedirects(HttpClient.Redirect.NEVER).build()) {
    var request = HttpRequest.newBuilder(URI.create("https://example.com/api/items"))
        .timeout(Duration.ofSeconds(5))
        .header("Accept", "application/json")
        .GET().build();
    assert request.timeout().orElseThrow().equals(Duration.ofSeconds(5));
    assert client.followRedirects() == HttpClient.Redirect.NEVER;
}`, 'The server destination is a trust boundary. Validate user-selected hosts and redirects when a backend fetches on a user’s behalf.'),
        lesson('Status, size, and schema are separate checks', 'An HTTP 200 does not prove the payload has the structure your application expects. The JDK does not include a general JSON parser; choose a maintained parser and validate a DTO/schema explicitly. ofString materializes the body, so untrusted or large responses need a bounded strategy. InputStream bodies require explicit closure and a separate body-read/deadline policy.', String.raw`// Transport pattern; requires a real endpoint and a client/request in scope.
var response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
try (var body = response.body()) {
    if (response.statusCode() != 200) throw new IOException("unexpected status: " + response.statusCode());
    byte[] bytes = body.readNBytes(1_000_001);
    if (bytes.length > 1_000_000) throw new IOException("response too large");
    // Decode using the API’s specified encoding and parse/validate JSON.
}
// Bound body-read time independently: headers can arrive before a body stalls.`, 'Content-Length can be missing or untrusted; enforce the actual read limit too. A size cap alone does not guarantee a time cap.', 'reference'),
        lesson('Retry only with a defined operation contract', 'Retries need bounded attempts, backoff with jitter, and knowledge of whether an operation is safe to repeat. A timed-out POST may already have succeeded; use an API-supported idempotency mechanism where available. Respect rate limits and Retry-After. Do not retry every 4xx response or silently swallow interruption.', String.raw`static boolean retryableStatus(int status) {
    return status == 429 || status == 502 || status == 503 || status == 504;
}
public static void main(String[] args) {
    assert retryableStatus(503);
    assert !retryableStatus(400);
    assert !retryableStatus(401);
}`, 'This status classifier is only one input to a retry policy; method semantics, attempt budgets, and server guidance still matter.', 'members')
      ],
      lab: lab('Validate a parsed count payload without a JSON dependency. Reject missing, negative, and incorrectly typed counts, while accepting zero.', String.raw`static int parseCount(Map<String, ?> payload) {
    Object value = payload.get("count");
    if (!(value instanceof Integer count) || count < 0) throw new IllegalArgumentException("nonnegative integer count required");
    return count;
}
public static void main(String[] args) {
    assert parseCount(Map.of("count", 0)) == 0;
    for (Map<String, ?> bad : List.<Map<String, ?>>of(Map.of(), Map.of("count", -1), Map.of("count", "1"))) {
        try { parseCount(bad); throw new AssertionError(); }
        catch (IllegalArgumentException expected) { }
    }
}`, 'This deliberately expects Integer. Real JSON libraries may produce Long or BigDecimal; define a checked conversion policy rather than using an unchecked cast.', 'members'),
      questions: [q('Does the JDK provide a general JSON parser?', ['Yes, in java.net.http', 'No; choose a parser separately', 'Only for records', 'Only over HTTPS'], 1, 'HTTP transport and JSON parsing are separate concerns.'), q('What does a 200 status prove?', ['All domain fields are valid', 'The server reports HTTP-level success', 'The body is small', 'Retries are safe'], 1, 'Schema and domain validation still need to run.'), q('Is every timed-out POST safe to repeat?', ['Yes', 'No; the server may already have applied it', 'Only with text', 'Only with redirects'], 1, 'Client uncertainty does not imply the server rolled back.'), q('Is a Content-Length header alone a sufficient size defense?', ['Yes', 'No; enforce a read limit too', 'Only for JSON', 'Only in Java 21'], 1, 'The actual bytes consumed must be bounded independently.')],
      reference: ['HttpClient', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html']
    },
    {
      title: 'JDBC & Transaction Boundaries', description: 'Prepared statements, resource ownership, commit/rollback, and pooling',
      objectives: ['Bind values safely and close JDBC resources.', 'Define transaction and isolation behavior deliberately.'],
      lessons: [
        lesson('JDBC is an API; the driver is separate', 'The JDK includes JDBC interfaces, but an actual database needs a matching JDBC driver and endpoint. A DataSource often supplies pooled connections; closing a borrowed connection returns it to the pool. Use try-with-resources for connections, statements, and result sets. The following is an integration pattern, not a standalone offline program.', String.raw`// Requires a configured javax.sql.DataSource and database schema.
try (var connection = dataSource.getConnection();
     var statement = connection.prepareStatement("SELECT name FROM users WHERE id = ?")) {
    statement.setLong(1, id);
    try (var rows = statement.executeQuery()) {
        if (rows.next()) return rows.getString("name");
        return null;
    }
}`, 'JDBC parameter indexes start at 1. Bind values; choose dynamic SQL identifiers from an allowlist.', 'reference'),
        lesson('Atomic changes require an explicit boundary', 'Connections normally begin with auto-commit enabled. Disable it for a multi-statement transaction, commit on success, and roll back on failure. Decide the isolation level and timeout according to the invariant. A failed rollback must not hide the original failure. Pools/frameworks may restore state, but do not assume every pool has identical reset behavior.', String.raw`// Integration sketch: connection is borrowed and owned by this operation.
connection.setAutoCommit(false);
try {
    // Execute all related updates using this same connection.
    connection.commit();
} catch (SQLException original) {
    try { connection.rollback(); }
    catch (SQLException rollbackFailure) { original.addSuppressed(rollbackFailure); }
    throw original;
}
// Close the connection at the owning boundary; restore reusable state if required.`, 'A database transaction cannot automatically make a remote HTTP call atomic with local SQL. Distributed workflows need a separate design.', 'reference'),
        lesson('Queries have resource and consistency costs', 'Avoid holding a transaction open during slow network calls. Pool size is a limit on database concurrency, not a guarantee of throughput. Use pagination, indexes guided by query plans, and bounded result processing. Optimistic locking compares a version in an UPDATE and checks the affected row count. Always define what a zero-row update means.', String.raw`// Optimistic update pattern (driver/schema required):
UPDATE accounts
SET balance = ?, version = version + 1
WHERE id = ? AND version = ?
-- Affected rows = 0 means missing row or conflicting version; handle explicitly.`, 'fetchSize is a driver-dependent hint, not a universal hard memory bound.', 'reference')
      ],
      lab: lab('Model an optimistic-lock check as a pure function: exactly one updated row is success, zero means conflict/missing, and any other count violates the contract.', String.raw`static void requireOneUpdate(int rows) {
    if (rows == 0) throw new IllegalStateException("conflict or missing record");
    if (rows != 1) throw new IllegalStateException("unexpected row count: " + rows);
}
public static void main(String[] args) {
    requireOneUpdate(1);
    for (int rows : new int[]{0, 2}) {
        try { requireOneUpdate(rows); throw new AssertionError(); }
        catch (IllegalStateException expected) { }
    }
}`, 'The executable exercise tests an application rule without pretending a JDBC driver is bundled. Add database integration tests when choosing an actual database.', 'members'),
      questions: [q('Can JDBC connect to every database without a driver?', ['Yes', 'No; a compatible driver is required', 'Only with records', 'Only from Maven'], 1, 'The standard API and vendor driver are different layers.'), q('What should untrusted SQL values use?', ['String concatenation', 'Prepared-statement parameters', 'An f-string', 'A shell command'], 1, 'Binding separates data from SQL syntax.'), q('What does auto-commit normally do?', ['Commits each completed statement as its own transaction', 'Disables constraints', 'Encrypts rows', 'Always waits for a manual commit'], 0, 'Multi-statement atomic changes need a deliberate transaction boundary.'), q('Can ? substitute an arbitrary table name?', ['Yes', 'No; parameters bind values, not SQL identifiers', 'Only with quotes', 'Only in SELECT'], 1, 'Validate identifiers through an allowlist and build only trusted SQL structure.')],
      reference: ['JDBC basics', 'https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html']
    },
    {
      title: 'Virtual Threads & Bounded Concurrency', description: 'Java 21 virtual threads, cancellation, resource limits, and preview boundaries',
      objectives: ['Use virtual threads for waiting-heavy work.', 'Limit downstream load independently of thread count.'],
      lessons: [
        lesson('Cheap waiting is not free computation', 'Virtual threads are final in Java 21 and run on a smaller number of carrier platform threads. They help scale workloads that spend time waiting on blocking I/O. CPU-heavy work still requires CPU capacity; creating more threads cannot manufacture cores. Use one virtual thread per task rather than pooling virtual threads.', String.raw`try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var future = executor.submit(() -> {
        assert Thread.currentThread().isVirtual();
        return "done";
    });
    assert future.get().equals("done");
}`, 'Keep task lifetimes owned by an enclosing operation and observe failures. Executor close waits; it is not an automatic short deadline.'),
        lesson('Bound downstream resources, not just workers', 'Cheap threads do not make database connections, memory, or remote services unlimited. A semaphore can cap calls to a scarce dependency. An operation can still create too many queued task objects, so also bound admission for very large inputs. Track deadlines and cancellation at the operation boundary.', String.raw`var permits = new Semaphore(2);
var active = new AtomicInteger();
var peak = new AtomicInteger();
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var tasks = new ArrayList<Future<?>>();
    for (int i = 0; i < 20; i++) tasks.add(executor.submit(() -> {
        permits.acquire();
        try {
            int current = active.incrementAndGet();
            peak.accumulateAndGet(current, Math::max);
            Thread.sleep(1);
        } finally { active.decrementAndGet(); permits.release(); }
        return null;
    }));
    for (var task : tasks) task.get();
}
assert peak.get() <= 2;`, 'Release a permit only after acquisition succeeded. Cancellation and resource cleanup must agree on ownership.'),
        lesson('Java 21-specific limitations and previews', 'In Java 21, blocking while inside synchronized code can pin a virtual thread to its carrier in relevant cases; diagnose it rather than assuming all blocking unmounts. Later JDKs change some pinning behavior, so keep version-specific guidance explicit. StructuredTaskScope and scoped values are preview in Java 21 and are intentionally excluded from runnable course examples.', String.raw`Thread task = Thread.ofVirtual().start(() -> {
    assert Thread.currentThread().isVirtual();
});
task.join();
// Do not enable --enable-preview merely to run this course.`, 'Use JFR/thread diagnostics and load tests for actual contention. Avoid replacing every lock blindly or claiming a virtual-thread migration guarantees faster requests.')
      ],
      lab: lab('Submit three tasks to a virtual-thread executor and collect results in input order. Close the executor and propagate failures.', String.raw`try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var futures = new ArrayList<Future<Integer>>();
    for (int value : List.of(3, 1, 2)) {
        futures.add(executor.submit(() -> value * 2));
    }
    var results = new ArrayList<Integer>();
    for (var future : futures) results.add(future.get());
    assert results.equals(List.of(6, 2, 4));
}`, 'Retaining futures in input order controls result order; tasks may execute in a different order.'),
      questions: [q('Which workload most directly benefits from virtual threads?', ['Long blocking I/O waits with sufficient downstream capacity', 'A single tiny integer addition', 'Unlimited CPU computation on one core', 'A sort that must remain sequential'], 0, 'Virtual threads reduce the cost of waiting-heavy concurrency.'), q('Should virtual threads usually be pooled?', ['Yes, in a fixed small pool', 'No; use one virtual thread per task', 'Only on Linux', 'Only with records'], 1, 'Limit scarce resources separately rather than pooling virtual threads.'), q('Does a virtual-thread executor bound database connections?', ['Yes', 'No; enforce a separate resource limit', 'Only for JDBC', 'Only for GET'], 1, 'The executor can create many tasks independent of a database pool’s capacity.'), q('Which needs preview flags in Java 21?', ['Virtual threads', 'StructuredTaskScope', 'Records', 'Pattern matching for switch'], 1, 'Structured concurrency is preview on the course baseline; the other listed features are final.')],
      reference: ['JEP 444', 'https://openjdk.org/jeps/444']
    },
    {
      title: 'Application Design & Service Boundaries', description: 'Pure logic, ports/adapters, validation, idempotency, and API contracts',
      objectives: ['Keep domain rules separate from frameworks and I/O.', 'Make retries and side effects part of the contract.'],
      lessons: [
        lesson('Keep the center easy to test', 'Place domain decisions in plain Java functions or objects. Translate HTTP, SQL, and messaging details in adapters. An interface is useful when it defines a real boundary or substitutable behavior; creating one for every class adds ceremony. Constructor injection makes required collaborators visible.', String.raw`interface DiscountPolicy { BigDecimal discount(BigDecimal subtotal); }
DiscountPolicy policy = subtotal -> subtotal.compareTo(new BigDecimal("100")) >= 0 ? new BigDecimal("10") : BigDecimal.ZERO;
assert policy.discount(new BigDecimal("150")).equals(new BigDecimal("10"));
assert policy.discount(new BigDecimal("50")).equals(BigDecimal.ZERO);`, 'Tests should exercise the business rule without starting a web server or dependency injection container.'),
        lesson('Validate at boundaries and preserve invariants', 'Parse external strings once, validate shape/ranges, and pass meaningful values inward. Distinguish an absent value from a present zero. Decide whether a collection result is a snapshot or live view. Return explicit error categories rather than leaking database exceptions or stack traces into a public API.', String.raw`record OrderQuantity(int value) {
    OrderQuantity {
        if (value < 1 || value > 1000) throw new IllegalArgumentException("quantity must be 1..1000");
    }
}
assert new OrderQuantity(1).value() == 1;
try { new OrderQuantity(1001); throw new AssertionError(); }
catch (IllegalArgumentException expected) { }`, 'A DTO, an entity, and a domain value can have different responsibilities. Do not automatically expose every persistence field in an API.'),
        lesson('Idempotency and distributed side effects', 'An operation is idempotent when repeating it has the same intended effect as doing it once. A local in-memory key set cannot provide durable exactly-once processing across crashes and multiple instances. Use durable deduplication, transactional outbox patterns, or API-supported idempotency according to the system boundary. A SQL transaction does not atomically include an arbitrary email or remote HTTP call.', String.raw`// Sequential toy example only: not durable or safe for concurrent production use.
var processed = new HashSet<String>();
var effects = new ArrayList<String>();
for (String key : List.of("request-1", "request-1")) {
    if (processed.add(key)) effects.add("send receipt");
}
assert effects.size() == 1;`, 'Production deduplication must define atomicity, failure recovery, retention, and what result repeated callers receive.')
      ],
      lab: lab('Implement a pure shipping-cost rule: nonnegative subtotal, free shipping from 100.00, otherwise 5.00. Test the exact threshold.', String.raw`static BigDecimal shipping(BigDecimal subtotal) {
    if (subtotal.signum() < 0) throw new IllegalArgumentException("negative subtotal");
    return subtotal.compareTo(new BigDecimal("100.00")) >= 0 ? new BigDecimal("0.00") : new BigDecimal("5.00");
}
public static void main(String[] args) {
    assert shipping(new BigDecimal("99.99")).equals(new BigDecimal("5.00"));
    assert shipping(new BigDecimal("100.00")).equals(new BigDecimal("0.00"));
}`, 'The rule is deterministic and contains no transport, persistence, or framework details.', 'members'),
      questions: [q('Where should a pure business rule ideally be testable?', ['Only inside a deployed server', 'In plain Java without framework startup', 'Only through SQL', 'Only by manual clicks'], 1, 'Isolating domain rules makes tests fast and deterministic.'), q('Does an in-memory HashSet guarantee exactly-once distributed effects?', ['Yes', 'No; it is neither durable nor a distributed atomic boundary', 'Only with String keys', 'Only with final'], 1, 'Crashes, concurrent instances, and partial effects require a stronger design.'), q('What is idempotency about?', ['Always returning HTTP 200', 'Repeating the operation has the same intended effect', 'Making every method synchronized', 'Disabling retries'], 1, 'It is an effect contract, not merely a response status.'), q('Does a local SQL transaction automatically include an outgoing email?', ['Yes', 'No', 'Only with auto-commit', 'Only from Spring'], 1, 'External effects need a coordination strategy beyond the local database transaction.')],
      reference: ['Spring transaction semantics', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html']
    },
    {
      title: 'Performance & Secure Coding', description: 'Profiling, JMH, bounded input, unsafe deserialization, and safe processes',
      objectives: ['Measure bottlenecks without misleading microbenchmarks.', 'Treat execution and resource consumption as explicit trust boundaries.'],
      lessons: [
        lesson('Measure real work before tuning', 'Start with a representative workload and a correctness baseline. JIT warmup, dead-code elimination, constant folding, and allocation behavior can distort naive timing loops. JFR helps find application bottlenecks; JMH is designed for controlled JVM microbenchmarks. Algorithm choice and database round trips often matter more than a shorter expression.', String.raw`var values = java.util.stream.IntStream.range(0, 10_000).boxed().toList();
var lookup = new HashSet<>(values);
assert values.contains(9999);
assert lookup.contains(9999);
// Building the set has a cost: include it if the real workload performs one lookup.`, 'Do not claim a speedup from a single nanoTime measurement. Profile the full operation and retain regression checks.'),
        lesson('Bound input and avoid executable serialization', 'Do not deserialize arbitrary ObjectInputStream data from an untrusted source. serialVersionUID and transient are not security controls. Prefer constrained formats, size limits, and schema validation. Use SecureRandom for security tokens; java.util.Random is for ordinary simulation. A dependency scan complements, but does not replace, safe application design.', String.raw`byte[] token = new byte[32];
new java.security.SecureRandom().nextBytes(token);
String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(token);
assert encoded.length() == 43;
// Do not print a real authentication token to logs.`, 'A safe parser can still be overwhelmed by huge or deeply nested input. Bound memory, time, rows, retries, and concurrency.'),
        lesson('Shells, paths, and data boundaries', 'ProcessBuilder accepts an executable and argument list without shell interpolation. Invoking sh -c or cmd /c reintroduces shell parsing. Values can still have meaning to the target executable, so validate its options too. Normalizing a path alone does not prevent traversal or symlink escapes; resolve against a trusted root and consider concurrent filesystem changes.', String.raw`var builder = new ProcessBuilder("java", "-version");
assert builder.command().equals(List.of("java", "-version"));
Path root = Path.of("reports").toAbsolutePath().normalize();
Path candidate = root.resolve("../outside.txt").normalize();
assert !candidate.startsWith(root);`, 'For security-sensitive filesystem access, account for symlinks and time-of-check/time-of-use races. Lexical path checks alone are not a complete defense.')
      ],
      lab: lab('Validate a bounded nonnegative record count from text. Reject overlong input before parsing and reject values beyond 100,000.', String.raw`static int boundedCount(String text) {
    if (text == null || text.length() > 6) throw new IllegalArgumentException("invalid count text");
    int value = Integer.parseInt(text);
    if (value < 0 || value > 100_000) throw new IllegalArgumentException("count out of range");
    return value;
}
public static void main(String[] args) {
    assert boundedCount("0") == 0;
    assert boundedCount("100000") == 100000;
    try { boundedCount("100001"); throw new AssertionError(); }
    catch (IllegalArgumentException expected) { }
}`, 'Validation is executable code, not an assert or a type annotation. Bounds should be based on the domain’s real capacity.', 'members'),
      questions: [q('Which tool is designed for JVM microbenchmarks?', ['JMH', 'A single println', 'A thread dump only', 'A random sleep'], 0, 'JMH accounts for common JVM measurement pitfalls when used correctly.'), q('What should generate a security token?', ['java.util.Random', 'SecureRandom', 'System.nanoTime', 'hashCode'], 1, 'SecureRandom is intended for cryptographically strong randomness.'), q('Does serialVersionUID make untrusted deserialization safe?', ['Yes', 'No', 'Only for final classes', 'Only on Java 21'], 1, 'It is a compatibility mechanism, not a safety boundary.'), q('When does ProcessBuilder reintroduce shell interpretation?', ['Always', 'When explicitly launching a shell with a command string', 'Only with lists', 'Never'], 1, 'Passing sh -c or cmd /c deliberately delegates parsing to a shell.')],
      reference: ['Java secure coding guidelines', 'https://www.oracle.com/java/technologies/javase/seccodeguide.html']
    },
    {
      title: 'Capstone: Expense Report CLI', description: 'Build a tested offline tool using records, BigDecimal, NIO, and a CLI',
      objectives: ['Combine validation, exact aggregation, file I/O, and explicit failures.', 'Verify the CLI contract with an executable standard-library test harness.'],
      lessons: [
        lesson('Start with an explicit input contract', 'The capstone reads a deliberately constrained UTF-8 tab-separated format: category and amount columns, one record per physical line, no quoting or embedded tabs/newlines. It is not a general CSV parser. Reject malformed input before printing any totals. Full source, sample data, and a test harness are in examples/expense-report/.', String.raw`category\tamount
books\t12.50
travel\t20.00
books\t7.25
// In the real file, separators are literal tab characters.
// Expected output:
// books: 19.75
// travel: 20.00`, 'The format intentionally stays simple enough to implement correctly without a third-party parser. General CSV requires a real CSV library.', 'reference'),
        lesson('Normalize money without silent rounding', 'Parse decimal text with BigDecimal and require exactly representable cents using RoundingMode.UNNECESSARY. Bound text length and per-record amounts. Reject scientific notation in this capstone to keep the public file format simple. Store valid records in a record type and aggregate only after parsing succeeds.', String.raw`static BigDecimal parseAmount(String text) {
    if (text.length() > 20 || !text.matches("[0-9]+(?:\\.[0-9]{1,2})?")) throw new IllegalArgumentException("invalid amount format");
    BigDecimal amount = new BigDecimal(text).setScale(2, RoundingMode.UNNECESSARY);
    if (amount.compareTo(new BigDecimal("999999999.99")) > 0) throw new IllegalArgumentException("amount too large");
    return amount;
}
public static void main(String[] args) {
    assert parseAmount("12.5").equals(new BigDecimal("12.50"));
    assert parseAmount("0").equals(new BigDecimal("0.00"));
}`, 'The runnable project uses the same policy, rejects blank categories and control characters, and limits file size and record count.', 'members'),
        lesson('A small deliverable with clear verification', 'Compile the project and tests with javac --release 21. Run the custom test harness: it uses explicit checks that remain active without -ea. A valid input prints sorted totals and exits zero. Invalid input writes a diagnostic to stderr, leaves stdout empty, and returns one; usage errors return two. No network or build tool is required.', String.raw`# From the repository root:
javac --release 21 -d examples/expense-report/out examples/expense-report/*.java
java -cp examples/expense-report/out ExpenseReport examples/expense-report/sample.tsv
java -cp examples/expense-report/out ExpenseReportTest
# Stretch goals: JSON output, date filters, JDBC persistence, Maven packaging.`, 'Define each extension’s input and error behavior before changing code. Add framework integration only when the plain-Java behavior is reliable.', 'reference')
      ],
      lab: lab('Aggregate validated expense records into sorted exact totals. Test repeated categories and empty input.', String.raw`record Expense(String category, BigDecimal amount) { }
var expenses = List.of(new Expense("books", new BigDecimal("0.10")), new Expense("books", new BigDecimal("0.20")));
var totals = new TreeMap<String, BigDecimal>();
for (var expense : expenses) totals.merge(expense.category(), expense.amount(), BigDecimal::add);
assert totals.get("books").equals(new BigDecimal("0.30"));
assert new TreeMap<String, BigDecimal>().isEmpty();`, 'The project separates parsing, aggregation, and terminal output, so each contract can be tested independently.'),
      questions: [q('Is the capstone input format general CSV?', ['Yes', 'No; it is constrained tab-separated text without quoting', 'Only with commas', 'Only on Linux'], 1, 'The format is deliberately limited and documented rather than pretending split handles quoted CSV.'), q('What prevents silent monetary rounding?', ['double arithmetic', 'BigDecimal with UNNECESSARY at the cents boundary', 'String formatting only', 'Casting to int'], 1, 'The boundary rejects amounts not exactly representable under the declared precision policy.'), q('What happens after a malformed later record?', ['Print earlier totals as success', 'A diagnostic, nonzero exit, and no partial stdout', 'Retry forever', 'Delete the file'], 1, 'Input is validated before output so callers cannot mistake partial data for a complete report.'), q('Which part is easiest to test without files?', ['Pure aggregation', 'Operating-system permissions', 'Process startup', 'Terminal encoding'], 0, 'Pure aggregation takes values and returns a result without external effects.')],
      reference: ['BigDecimal', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html']
    }
  ];
  engineering.forEach((chapter, index) => CHAPTERS.push({
    id: index + 12, title: chapter.title, description: chapter.description,
    objectives: chapter.objectives,
    steps: [...chapter.lessons, { ...chapter.questions[0], type: 'question', title: 'Quick check' }, chapter.lab],
    quiz: chapter.questions, reference: chapter.reference
  }));
  CHAPTERS.forEach(chapter => {
    chapter.revision = 2;
    chapter.track = chapter.id <= 11 ? 'Foundations' : 'Engineering';
    chapter.estimatedMinutes = chapter.id <= 11 ? 30 : 40;
    const references = ['java/lang/package-summary.html', 'java/lang/Object.html', 'java/util/Collection.html', 'java/util/List.html', 'java/lang/Throwable.html', 'java/nio/file/Files.html', 'java/util/function/package-summary.html', 'java/util/stream/package-summary.html', 'java/util/concurrent/package-summary.html', 'java/lang/Record.html'];
    if (!chapter.reference && chapter.id <= 10) chapter.reference = ['Java 21 API reference', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/' + references[chapter.id - 1]];
    if (chapter.id === 11) chapter.reference = ['Spring Framework reference', 'https://docs.spring.io/spring-framework/reference/'];
    chapter.steps.forEach((step, index) => {
      if (!step.title) {
        const heading = step.content?.match(/<strong>([\s\S]*?)<\/strong>/)?.[1];
        step.title = heading ? heading.replace(/<[^>]+>/g, '') : step.type === 'question' ? `Quick check ${index + 1}` : `Lesson ${index + 1}`;
      }
    });
  });
})();
