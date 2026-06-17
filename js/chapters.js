const CHAPTERS = [
  // =====================================================================
  // CHAPTER 1 — Java Fundamentals
  // =====================================================================
  {
    id: 1,
    title: "Java Fundamentals",
    description: "Types, variables, operators, and control flow — the building blocks of every Java program.",
    steps: [
      {
        type: "lesson",
        content: `<p>Java is a <strong>statically-typed</strong>, compiled language that runs on the <strong>JVM</strong> (Java Virtual Machine). Source code (<code>.java</code>) is compiled to bytecode (<code>.class</code>), which the JVM interprets and executes.</p>
<p>There are 8 primitive types:</p>
<ul>
  <li><strong>byte</strong> (8-bit, -128 to 127)</li>
  <li><strong>short</strong> (16-bit)</li>
  <li><strong>int</strong> (32-bit)</li>
  <li><strong>long</strong> (64-bit, suffix <code>L</code>)</li>
  <li><strong>float</strong> (32-bit, suffix <code>f</code>)</li>
  <li><strong>double</strong> (64-bit)</li>
  <li><strong>char</strong> (16-bit Unicode)</li>
  <li><strong>boolean</strong> (true / false)</li>
</ul>
<p>Everything else is an <strong>object</strong> — including arrays and <code>String</code>.</p>`
      },
      {
        type: "question",
        question: "What is the default value of a <code>boolean</code> field in a class?",
        options: ["true", "false", "null", "Compiler error — must be initialized"],
        correct: 1,
        explanation: "In Java, class fields (instance/static variables) are automatically initialized to their default values. <code>boolean</code> defaults to <code>false</code>."
      },
      {
        type: "lesson",
        content: `<p><strong>Local variables</strong> (declared inside a method) are <em>not</em> given default values. You must initialize them before use or the compiler will reject the code.</p>
<div class="code-block">
<span class="type">int</span> x;          <span class="comment">// class field → defaults to 0</span>
<span class="keyword">void</span> foo() {
  <span class="type">int</span> y;        <span class="comment">// local variable → compiler error!</span>
  <span class="type">int</span> z = <span class="number">42</span>;   <span class="comment">// OK</span>
}
</div>`
      },
      {
        type: "question",
        question: "What does <code>\"Java\".toUpperCase()</code> return?",
        options: ["\"JAVA\"", "\"java\"", "\"Java\"", "\"JAVa\""],
        correct: 0,
        explanation: "String is immutable in Java. <code>toUpperCase()</code> returns a <strong>new</strong> String with the content converted to uppercase. The original is unchanged."
      },
      {
        type: "lesson",
        content: `<p><strong>String immutability</strong>: once created, a String cannot be changed. Every "modification" produces a new String object. This enables string pooling and thread safety.</p>
<p><strong>Control flow</strong> basics:</p>
<ul>
  <li><code>if / else if / else</code> — conditional branching</li>
  <li><code>switch</code> — multi-way branch (works with <code>int</code>, <code>String</code>, <code>enum</code>, and now patterns in modern Java)</li>
  <li><code>for</code>, <code>while</code>, <code>do-while</code> — loops</li>
  <li><code>break</code> — exits the innermost loop or switch</li>
  <li><code>continue</code> — skips to the next iteration</li>
</ul>`
      },
      {
        type: "question",
        question: "What happens if you omit <code>break</code> in a <code>switch</code> case?",
        options: [
          "The code falls through to the next case",
          "The compiler throws an error",
          "The switch block exits automatically",
          "A runtime exception is thrown"
        ],
        correct: 0,
        explanation: "Without <code>break</code>, execution <strong>falls through</strong> to the next case. This is by design and can be useful, but often leads to bugs."
      },
      {
        type: "lesson",
        content: `<p><strong>Operators</strong> refresher:</p>
<ul>
  <li><code>==</code> compares primitives by value, but <strong>references</strong> for objects — use <code>.equals()</code> for object equality</li>
  <li><code>&&</code> and <code>||</code> are short-circuit operators</li>
  <li><code>&</code> and <code>|</code> are non-short-circuit (always evaluate both sides)</li>
  <li><code>instanceof</code> checks type at runtime</li>
  <li><code>?:</code> ternary conditional operator</li>
</ul>`
      },
      {
        type: "question",
        question: "What does this print? <code>System.out.println(10 / 3);</code>",
        options: ["3.333...", "3", "3.0", "Compilation error"],
        correct: 1,
        explanation: "Integer division truncates toward zero. Both operands are <code>int</code>, so the result is <code>int</code> — <code>3</code>. Use <code>10 / 3.0</code> for floating-point division."
      }
    ],
    quiz: [
      { question: "Which is NOT a Java primitive type?", options: ["int", "String", "boolean", "double"], correct: 1, explanation: "String is a class (reference type), not a primitive." },
      { question: "What is the default value of a local variable?", options: ["0", "null", "false", "It has no default — must be initialized"], correct: 3, explanation: "Local variables must be explicitly initialized before use." },
      { question: "What does <code>\"Hello\".charAt(1)</code> return?", options: ["'H'", "'e'", "'l'", "'o'"], correct: 1, explanation: "Indexing is 0-based. <code>charAt(0)</code> is 'H', <code>charAt(1)</code> is 'e'." },
      { question: "Which operator short-circuits?", options: ["&", "|", "&&", "^"], correct: 2, explanation: "&& short-circuits: if the left side is false, the right side is never evaluated." },
      { question: "What range does <code>byte</code> cover?", options: ["0 to 255", "-128 to 127", "-255 to 255", "-32,768 to 32,767"], correct: 1, explanation: "byte is 8-bit signed, ranging from -128 to 127." }
    ]
  },

  // =====================================================================
  // CHAPTER 2 — Object-Oriented Programming
  // =====================================================================
  {
    id: 2,
    title: "Object-Oriented Programming",
    description: "Classes, inheritance, polymorphism, interfaces, abstract classes, and the pillars of OOP.",
    steps: [
      {
        type: "lesson",
        content: `<p>Java is fundamentally object-oriented. The <strong>four pillars</strong> are:</p>
<ul>
  <li><strong>Encapsulation</strong> — bundle data + behavior; hide internals via access modifiers</li>
  <li><strong>Inheritance</strong> — <code>extends</code> a class to reuse and specialize behavior</li>
  <li><strong>Polymorphism</strong> — treat objects of different types through a common interface</li>
  <li><strong>Abstraction</strong> — hide implementation details (<code>abstract</code> classes, <code>interface</code>)</li>
</ul>
<p><strong>Access modifiers</strong> from most to least restrictive: <code>private</code> → default (package-private) → <code>protected</code> → <code>public</code></p>`
      },
      {
        type: "question",
        question: "A class with <code>protected</code> fields can be accessed by:",
        options: [
          "Only the class itself",
          "Any class in the same package",
          "Subclasses (even in different packages) and same-package classes",
          "Every class in the universe"
        ],
        correct: 2,
        explanation: "protected allows access within the same package AND by subclasses in any package."
      },
      {
        type: "lesson",
        content: `<p><strong>Constructors</strong>:</p>
<ul>
  <li>If you don't define any constructor, Java provides a <strong>no-arg default constructor</strong></li>
  <li>If you define <em>any</em> constructor, the default is <em>not</em> provided</li>
  <li><code>super()</code> must be the first statement in a constructor to call the parent constructor</li>
  <li><code>this()</code> calls another constructor in the same class</li>
</ul>`
      },
      {
        type: "question",
        question: "What happens if a subclass constructor does not call <code>super()</code> explicitly?",
        options: [
          "The compiler inserts <code>super()</code> automatically",
          "Compilation fails",
          "The parent class is not initialized",
          "The subclass inherits the parent's constructor"
        ],
        correct: 0,
        explanation: "If no <code>super()</code> call is present, the compiler inserts <code>super()</code> automatically — which calls the parent's no-arg constructor."
        },
        {
          type: "lesson",
          content: `<p><strong>Polymorphism</strong> enables you to write code against a supertype while the actual runtime type can be any subtype.</p>
  <div class="code-block">
  <span class="type">List</span>&lt;<span class="type">String</span>&gt; list = <span class="keyword">new</span> <span class="type">ArrayList</span>&lt;&gt;();
  list = <span class="keyword">new</span> <span class="type">LinkedList</span>&lt;&gt;();   <span class="comment">// same interface, different behavior</span>
  </div>
  <p><strong>Overriding</strong> — subclass redefines a parent method. Annotations like <code>@Override</code> help catch errors at compile time.</p>
  <p>Rules for overriding: same signature, same or broader access, same return type (or covariant), can't throw broader checked exceptions.</p>`
        },
        {
          type: "question",
          question: "Which is true about method overriding?",
          options: [
            "The overriding method must have a narrower access modifier",
            "The overriding method can throw any new exception",
            "The return type must be the same or a subtype (covariant)",
            "Static methods can be overridden"
          ],
          correct: 2,
          explanation: "Covariant return types are allowed — the override can return a subtype. Access must be same or wider, exceptions must be same or narrower."
        },
        {
          type: "lesson",
          content: `<p><strong>Abstract classes</strong> vs <strong>Interfaces</strong> (pre-Java 8):</p>
  <ul>
    <li>Abstract class: can have state (fields), constructors, both abstract and concrete methods</li>
    <li>Interface: originally only abstract method signatures; no state</li>
  </ul>
  <p><strong>Java 8+</strong> interfaces can have <code>default</code> and <code>static</code> methods.</p>
  <p><strong>Java 9+</strong> interfaces can have <code>private</code> helper methods.</p>
  <p>Key difference: a class can <code>extends</code> at most one class but <code>implements</code> many interfaces.</p>`
        },
        {
          type: "question",
          question: "How many classes can a Java class extend? How many interfaces can it implement?",
          options: [
            "Multiple classes, multiple interfaces",
            "One class, one interface",
            "One class, multiple interfaces",
            "Multiple classes, one interface"
          ],
          correct: 2,
          explanation: "Java supports single-class inheritance but multiple interface inheritance: <code>extends</code> at most one, <code>implements</code> many."
        }
      ],
      quiz: [
        { question: "Which keyword is used to inherit a class?", options: ["implements", "extends", "inherits", "super"], correct: 1, explanation: "extends is used for class inheritance. implements is for interfaces." },
        { question: "Can you override a private method?", options: ["Yes", "No — private methods are not inherited", "Yes, but only in the same class", "Only with @Override annotation"], correct: 1, explanation: "Private methods are not visible to subclasses, so they cannot be overridden." },
        { question: "What does <code>@Override</code> do?", options: ["Makes the method run faster", "Tells the compiler to check that you're actually overriding a superclass method", "Makes the method final", "Removes the parent's method"], correct: 1, explanation: "@Override is an annotation that causes a compilation error if the method doesn't actually override a parent method." },
        { question: "Which access modifier allows access from anywhere?", options: ["private", "protected", "default", "public"], correct: 3, explanation: "public is the least restrictive — accessible from any class in any package." },
        { question: "A class declared <code>final</code> cannot:", options: ["Be instantiated", "Be extended", "Implement interfaces", "Have fields"], correct: 1, explanation: "final on a class prevents subclassing. final on a method prevents overriding." }
      ]
    },

  // =====================================================================
  // CHAPTER 3 — Collections Framework
  // =====================================================================
  {
    id: 3,
    title: "Collections Framework",
    description: "List, Set, Map, Queue — choosing the right collection, equals/hashCode, sorting.",
    steps: [
      {
        type: "lesson",
        content: `<p>The Java Collections Framework provides a unified architecture for storing and manipulating groups of objects.</p>
  <p><strong>Core interfaces:</strong></p>
  <ul>
    <li><code>Collection</code> — the root interface (List, Set, Queue extend it)</li>
    <li><code>List</code> — ordered, allows duplicates (<code>ArrayList</code>, <code>LinkedList</code>)</li>
    <li><code>Set</code> — no duplicates (<code>HashSet</code>, <code>TreeSet</code>, <code>LinkedHashSet</code>)</li>
    <li><code>Queue</code> / <code>Deque</code> — for FIFO / LIFO processing</li>
    <li><code>Map</code> — key-value pairs (not extending Collection)</li>
  </ul>`
      },
      {
        type: "question",
        question: "Which collection guarantees insertion order AND allows duplicates?",
        options: ["HashSet", "ArrayList", "TreeSet", "HashMap"],
        correct: 1,
        explanation: "ArrayList maintains insertion order and allows duplicates. HashSet is unordered. TreeSet is sorted."
      },
      {
        type: "lesson",
        content: `<p><strong>HashMap</strong> internals:</p>
  <ul>
    <li>Uses <code>hashCode()</code> to find a bucket</li>
    <li>Uses <code>equals()</code> to find the exact key within the bucket</li>
    <li>If two objects are equal, they <strong>must</strong> have the same hashCode</li>
    <li>If two objects are not equal, they <em>may</em> have the same hashCode (collision)</li>
    <li>From Java 8: buckets with many collisions switch from linked list to balanced tree for performance</li>
  </ul>`
      },
      {
        type: "question",
        question: "If you override <code>equals()</code> but NOT <code>hashCode()</code>, what happens with HashSet?",
        options: [
          "Works fine — hashCode is derived from equals",
          "Objects that are equal may end up in different buckets, causing duplicates",
          "Compilation error",
          "HashSet will refuse to store the objects"
        ],
        correct: 1,
        explanation: "If equals() says two objects are equal but they have different hashCodes, they'll land in different buckets and HashSet will treat them as distinct."
      },
      {
        type: "lesson",
        content: `<p><strong>equals() contract</strong> (from Object): reflexive, symmetric, transitive, consistent, and <code>x.equals(null)</code> returns false.</p>
  <p><strong>Comparable vs Comparator:</strong></p>
  <ul>
    <li><code>Comparable</code> — natural ordering (<code>compareTo</code> in the class itself)</li>
    <li><code>Comparator</code> — external ordering (separate class or lambda)</li>
  </ul>
  <div class="code-block">
  <span class="comment">// Comparable</span>
  <span class="keyword">class</span> <span class="type">Person</span> <span class="keyword">implements</span> <span class="type">Comparable</span>&lt;<span class="type">Person</span>&gt; { ... }
  
  <span class="comment">// Comparator (lambda)</span>
  list.sort((a, b) -> a.age() - b.age());
  </div>`
      },
      {
        type: "question",
        question: "What's the difference between <code>Comparator</code> and <code>Comparable</code>?",
        options: [
          "They are the same thing",
          "Comparable is for natural ordering (in the class); Comparator is external",
          "Comparator is for primitive types; Comparable is for objects",
          "Comparable is a class; Comparator is an interface"
        ],
        correct: 1,
        explanation: "Comparable defines natural ordering within the class (compareTo). Comparator defines external ordering outside the class."
      },
      {
        type: "lesson",
        content: `<p><strong>Choosing the right collection:</strong></p>
  <ul>
    <li>Need fast random access? → <code>ArrayList</code></li>
    <li>Need fast inserts/deletes in the middle? → <code>LinkedList</code></li>
    <li>Need unique elements? → <code>HashSet</code> (or <code>TreeSet</code> if sorted)</li>
    <li>Need key-value lookups? → <code>HashMap</code> (or <code>TreeMap</code> if sorted)</li>
    <li>Need thread safety? → <code>ConcurrentHashMap</code>, <code>CopyOnWriteArrayList</code></li>
  </ul>`
      },
      {
        type: "question",
        question: "Which collection would you use for a thread-safe key-value store with high concurrency?",
        options: ["HashMap", "Hashtable", "ConcurrentHashMap", "TreeMap"],
        correct: 2,
        explanation: "ConcurrentHashMap is designed for high-concurrency access. Hashtable is synchronized but with poor performance."
      }
    ],
    quiz: [
      { question: "Which interface does Map extend?", options: ["Collection", "Iterable", "Neither — Map is separate", "Set"], correct: 2, explanation: "Map does NOT extend Collection. It's a separate top-level interface in the collections framework." },
      { question: "What does <code>Set.add()</code> return if the element already exists?", options: ["true", "false", "null", "Throws exception"], correct: 1, explanation: "Set.add() returns true if the element was added (was not already present), false otherwise." },
      { question: "Which List implementation is best for frequent insertions/removals at the beginning?", options: ["ArrayList", "LinkedList", "Vector", "Stack"], correct: 1, explanation: "LinkedList offers O(1) insertion/removal at both ends. ArrayList would be O(n) shifting elements." },
      { question: "What must you override to use an object as a key in a HashMap correctly?", options: ["equals() only", "hashCode() only", "Both equals() and hashCode()", "toString()"], correct: 2, explanation: "Both must be overridden consistently for HashMap to work correctly." },
      { question: "Which collection maintains elements in their natural sorted order?", options: ["HashSet", "ArrayList", "TreeSet", "LinkedList"], correct: 2, explanation: "TreeSet keeps elements sorted according to their natural ordering (Comparable) or a provided Comparator." }
    ]
  },

  // =====================================================================
  // CHAPTER 4 — Generics
  // =====================================================================
  {
    id: 4,
    title: "Generics",
    description: "Type parameters, wildcards, type erasure, and bounds — writing type-safe reusable code.",
    steps: [
      {
        type: "lesson",
        content: `<p><strong>Generics</strong> enable types (classes and interfaces) to be type parameters when defining classes, interfaces, and methods.</p>
  <div class="code-block">
  <span class="comment">// Generic class</span>
  <span class="keyword">class</span> <span class="type">Box</span>&lt;T&gt; {
    <span class="keyword">private</span> T value;
    <span class="keyword">public</span> T get() { <span class="keyword">return</span> value; }
    <span class="keyword">public</span> <span class="keyword">void</span> set(T value) { <span class="keyword">this</span>.value = value; }
  }
  </div>
  <p>Benefits: stronger type checks at compile time, elimination of casts, enabling generic algorithms.</p>`
      },
      {
        type: "question",
        question: "What is <strong>type erasure</strong>?",
        options: [
          "The JVM forgets types at runtime to save memory",
          "The compiler removes generic type information, replacing with bounds or Object",
          "A garbage collection technique",
          "An annotation that removes type checks"
        ],
        correct: 1,
        explanation: "Type erasure means generic type information is removed at compile time. <code>List&lt;String&gt;</code> becomes just <code>List</code> at runtime."
      },
      {
        type: "lesson",
        content: `<p><strong>Wildcards</strong> (<code>?</code>) add flexibility:</p>
  <ul>
    <li><code>? extends T</code> — upper bound (producer: read from it)</li>
    <li><code>? super T</code> — lower bound (consumer: write to it)</li>
    <li><code>?</code> — unbounded wildcard</li>
  </ul>
  <p>The <strong>PECS</strong> rule: <strong>P</strong>roducer <strong>E</strong>xtends, <strong>C</strong>onsumer <strong>S</strong>uper.</p>`
      },
      {
        type: "question",
        question: "If a method takes <code>List&lt;? extends Number&gt;</code>, can you add a new Integer to it?",
        options: [
          "Yes — Integer extends Number",
          "No — you can only read from it, not add (except null)",
          "Yes, but only Doubles",
          "Only if you cast it"
        ],
        correct: 1,
        explanation: "With <code>? extends Number</code>, you don't know the exact type (could be List&lt;Double&gt;). You can only read (producer). You cannot add anything except null."
      },
      {
        type: "lesson",
        content: `<p><strong>Generic methods:</strong></p>
  <div class="code-block">
  <span class="keyword">public</span> &lt;T extends <span class="type">Comparable</span>&lt;T&gt;&gt; T max(T a, T b) {
    <span class="keyword">return</span> a.compareTo(b) > <span class="number">0</span> ? a : b;
  }
  </div>
  <p>The type parameter <code>&lt;T&gt;</code> is declared before the return type. Bounds (<code>extends</code>) constrain what types can be used.</p>
  <p><strong>Diamond operator</strong> (<code>&lt;&gt;</code>) — since Java 7, the compiler infers type arguments:</p>
  <div class="code-block">
  <span class="type">List</span>&lt;<span class="type">String</span>&gt; list = <span class="keyword">new</span> <span class="type">ArrayList</span>&lt;&gt;();
  </div>`
      },
      {
        type: "question",
        question: "Which is NOT allowed with generics?",
        options: [
          "List<List<String>>",
          "new T() (creating an instance of type parameter)",
          "List<? extends Number>",
          "Generic interface"
        ],
        correct: 1,
        explanation: "You cannot create an instance of a type parameter (<code>new T()</code>) due to type erasure — the JVM doesn't know T at runtime."
      }
    ],
    quiz: [
      { question: "What does type erasure enable?", options: ["Faster code", "Backward compatibility with pre-generics code", "Runtime type checking", "Smaller bytecode"], correct: 1, explanation: "Type erasure allows generic code to be compatible with code written before generics were introduced (Java 5)." },
      { question: "What does <code>? super Integer</code> mean?", options: ["Integer or any of its subclasses", "Integer or any of its superclasses", "Only Integer", "Any type"], correct: 1, explanation: "? super Integer is a lower bound — Integer and its supertypes (Number, Object)." },
      { question: "Can you use primitives as type arguments?", options: ["Yes", "No — must use wrapper types", "Only int and long", "Only with autoboxing"], correct: 1, explanation: "Generics work only with reference types. Use <code>Integer</code> instead of <code>int</code>." },
      { question: "What is the erasure of <code>&lt;T extends Comparable&lt;T&gt;&gt;</code>?", options: ["Object", "Comparable", "T", "Comparable<T>"], correct: 1, explanation: "The erasure is the leftmost bound — <code>Comparable</code> in this case." },
      { question: "What does the diamond operator <code>&lt;&gt;</code> mean?", options: ["An empty generic type", "The compiler infers the type argument", "A wildcard", "Raw type"], correct: 1, explanation: "The diamond allows the compiler to infer the type argument from context." }
    ]
  },

  // =====================================================================
  // CHAPTER 5 — Exception Handling
  // =====================================================================
  {
    id: 5,
    title: "Exception Handling",
    description: "Checked vs unchecked, try-catch-finally, try-with-resources, and best practices.",
    steps: [
      {
        type: "lesson",
        content: `<p>Java exceptions are objects that represent abnormal conditions. The Throwable hierarchy:</p>
  <ul>
    <li><strong>Error</strong> — serious JVM issues (OutOfMemoryError), typically not catchable</li>
    <li><strong>Exception</strong> — conditions a program should handle</li>
    <li><strong>RuntimeException</strong> — unchecked exceptions (NullPointerException, IllegalArgumentException)</li>
  </ul>
  <p><strong>Checked</strong> exceptions (not RuntimeException) must be either caught or declared with <code>throws</code>.</p>`
      },
      {
        type: "question",
        question: "Which is a checked exception?",
        options: ["NullPointerException", "IllegalArgumentException", "IOException", "ArithmeticException"],
        correct: 2,
        explanation: "IOException is a checked exception (extends Exception, not RuntimeException). The others are unchecked RuntimeExceptions."
      },
      {
        type: "lesson",
        content: `<p><strong>try-catch-finally</strong>:</p>
  <div class="code-block">
  <span class="keyword">try</span> {
    <span class="comment">// risky code</span>
  } <span class="keyword">catch</span> (<span class="type">IOException</span> e) {
    <span class="comment">// handle IOException</span>
  } <span class="keyword">catch</span> (<span class="type">Exception</span> e) {
    <span class="comment">// handle any other exception</span>
  } <span class="keyword">finally</span> {
    <span class="comment">// always executes (even with return)</span>
  }
  </div>
  <p><code>finally</code> always runs — even if there's a <code>return</code> in try or catch, unless the JVM crashes.</p>`
      },
      {
        type: "question",
        question: "Does <code>finally</code> execute if there's a <code>return</code> in the <code>try</code> block?",
        options: [
          "Yes",
          "No — return exits immediately",
          "Depends on the exception type",
          "Only if there's no catch"
        ],
        correct: 0,
        explanation: "finally always executes, even if try or catch has a return statement. The finally runs before the method returns."
      },
      {
        type: "lesson",
        content: `<p><strong>try-with-resources</strong> (Java 7+): automatically closes resources that implement <code>AutoCloseable</code>.</p>
  <div class="code-block">
  <span class="keyword">try</span> (<span class="type">BufferedReader</span> br = <span class="keyword">new</span> <span class="type">BufferedReader</span>(...)) {
    <span class="comment">// br is automatically closed</span>
  } <span class="keyword">catch</span> (<span class="type">IOException</span> e) {
    <span class="comment">// handle</span>
  }
  </div>
  <p>Resources are closed in reverse order of declaration. More concise and safer than manually closing in finally.</p>`
      },
      {
        type: "question",
        question: "Which interface must a resource implement to be used in try-with-resources?",
        options: ["Serializable", "Closeable", "AutoCloseable", "Runnable"],
        correct: 2,
        explanation: "AutoCloseable (or its subinterface Closeable). AutoCloseable has a single method: <code>void close()</code>."
      },
      {
        type: "lesson",
        content: `<p><strong>Multi-catch</strong> (Java 7+): catch multiple exception types in one block:</p>
  <div class="code-block">
  <span class="keyword">catch</span> (<span class="type">IOException</span> | <span class="type">SQLException</span> e) {
    <span class="comment">// handle both</span>
  }
  </div>
  <p><strong>Best practices:</strong></p>
  <ul>
    <li>Catch the most specific exception first</li>
    <li>Never catch <code>Throwable</code> — you'll catch Errors too</li>
    <li>Don't swallow exceptions — log or rethrow</li>
    <li>Use custom exceptions for domain-specific errors</li>
  </ul>`
      },
      {
        type: "question",
        question: "What's wrong with catching <code>Exception</code> at the top of a catch chain?",
        options: [
          "Nothing — it's the safest approach",
          "It will catch checked exceptions only",
          "It will make the catch blocks after it unreachable",
          "It will cause a compilation error"
        ],
        correct: 2,
        explanation: "More specific catches must come before more general ones. If Exception is first, subsequent catch blocks for subtypes are unreachable."
      }
    ],
    quiz: [
      { question: "Which is the base class for all exceptions?", options: ["Throwable", "Exception", "RuntimeException", "Error"], correct: 0, explanation: "Throwable is the root class. Exception extends Throwable, not the other way around." },
      { question: "Can a method declare <code>throws</code> for an unchecked exception?", options: ["Yes, but it's optional", "No — only checked exceptions", "Only RuntimeException", "Only in abstract methods"], correct: 0, explanation: "You can declare throws for any Throwable, but it's not required for unchecked exceptions." },
      { question: "What does try-with-resources guarantee?", options: ["No exceptions occur", "Resources are closed automatically", "Faster execution", "No need for catch blocks"], correct: 1, explanation: "try-with-resources guarantees that each resource is closed at the end of the statement." },
      { question: "Which is NOT a good exception handling practice?", options: ["Catching specific exceptions", "Logging exceptions before rethrowing", "Catching Exception everywhere for safety", "Using finally for cleanup"], correct: 2, explanation: "Catching generic Exception is bad practice — it hides bugs and catches things you didn't intend to catch." },
      { question: "What happens if both try and finally throw an exception?", options: ["The finally exception propagates, try exception is suppressed", "The try exception propagates", "Both propagate as a multi-exception", "JVM crashes"], correct: 0, explanation: "The finally exception propagates. The try exception is suppressed (available via getSuppressed() in Java 7+)." }
    ]
  },

  // =====================================================================
  // CHAPTER 6 — I/O & NIO
  // =====================================================================
  {
    id: 6,
    title: "I/O & NIO",
    description: "Streams, Readers/Writers, File I/O, and the modern NIO.2 API (Path, Files).",
    steps: [
      {
        type: "lesson",
        content: `<p><strong>Java I/O</strong> is built on streams:</p>
  <ul>
    <li><strong>Byte streams</strong> (<code>InputStream</code>, <code>OutputStream</code>) — binary data</li>
    <li><strong>Character streams</strong> (<code>Reader</code>, <code>Writer</code>) — text data (handles charset encoding)</li>
  </ul>
  <p><strong>Bridges:</strong> <code>InputStreamReader</code> wraps a byte stream into a character stream. <code>OutputStreamWriter</code> does the reverse.</p>`
      },
      {
        type: "question",
        question: "Which class would you use to read a text file with a specific charset?",
        options: ["FileInputStream", "FileReader", "InputStreamReader wrapping FileInputStream", "DataInputStream"],
        correct: 2,
        explanation: "FileReader uses the platform default charset. To specify a charset, use InputStreamReader(FileInputStream, Charset)."
      },
      {
        type: "lesson",
        content: `<p><strong>Buffered streams</strong> wrap raw streams to add buffering, reducing disk I/O:</p>
  <div class="code-block">
  <span class="type">BufferedReader</span> br = <span class="keyword">new</span> <span class="type">BufferedReader</span>(
    <span class="keyword">new</span> <span class="type">FileReader</span>(<span class="string">"file.txt"</span>)
  );
  <span class="type">String</span> line;
  <span class="keyword">while</span> ((line = br.readLine()) != <span class="keyword">null</span>) {
    <span class="comment">// process line</span>
  }
  br.close();
  </div>`
      },
      {
        type: "lesson",
        content: `<p><strong>NIO.2</strong> (Java 7+) — modern, more intuitive file I/O:</p>
  <div class="code-block">
  <span class="type">Path</span> path = <span class="type">Paths</span>.get(<span class="string">"/home/user/file.txt"</span>);
  <span class="type">List</span>&lt;<span class="type">String</span>&gt; lines = <span class="type">Files</span>.readAllLines(path);
  <span class="type">Files</span>.write(path, <span class="string">"Hello"</span>.getBytes());
  </div>
  <p>Key classes: <code>Path</code>, <code>Paths</code>, <code>Files</code> (static utility methods).</p>`
      },
      {
        type: "question",
        question: "What does <code>Files.walk(path)</code> return?",
        options: [
          "A List of files",
          "A Stream<Path> of the file tree",
          "A DirectoryStream",
          "A BufferedReader"
        ],
        correct: 1,
        explanation: "Files.walk() returns a Stream<Path> that lazily traverses the directory tree depth-first."
      },
      {
        type: "lesson",
        content: `<p><strong>Serialization</strong> converts an object to bytes for storage or transmission:</p>
  <ul>
    <li>Implement <code>Serializable</code> (marker interface)</li>
    <li>Use <code>ObjectOutputStream</code> / <code>ObjectInputStream</code></li>
    <li><code>transient</code> fields are not serialized</li>
    <li><code>serialVersionUID</code> helps with versioning</li>
  </ul>`
      },
      {
        type: "question",
        question: "What does the <code>transient</code> keyword do?",
        options: [
          "Makes a field volatile",
          "Excludes the field from serialization",
          "Makes the field thread-safe",
          "Deletes the field after serialization"
        ],
        correct: 1,
        explanation: "transient tells the serialization mechanism to skip that field when serializing the object."
      }
    ],
    quiz: [
      { question: "Which class reads primitive types (int, double) from an input stream?", options: ["BufferedReader", "DataInputStream", "ObjectInputStream", "FileReader"], correct: 1, explanation: "DataInputStream reads primitive Java types in a portable way from an underlying InputStream." },
      { question: "What is the difference between <code>File</code> and <code>Path</code>?", options: ["Same thing, different name", "File is older (Java 1.0); Path is newer (Java 7) with better API", "File is abstract; Path is concrete", "Path can't read files"], correct: 1, explanation: "java.io.File is the old API. java.nio.file.Path (with Files helper) is the modern NIO.2 replacement." },
      { question: "Which method reads all lines from a file into a List in one call?", options: ["Files.lines()", "Files.readAllLines()", "Files.readString()", "Files.list()"], correct: 1, explanation: "Files.readAllLines() reads all lines into a List<String>. Files.lines() returns a Stream." },
      { question: "What is the purpose of <code>serialVersionUID</code>?", options: ["Encrypts the serialized data", "Identifies the class version for deserialization compatibility", "Stores the object's hashCode", "Speeds up serialization"], correct: 1, explanation: "serialVersionUID is used during deserialization to verify that the sender and receiver have loaded compatible classes." },
      { question: "Which of these is NOT a NIO.2 class?", options: ["Path", "Files", "FileInputStream", "Paths"], correct: 2, explanation: "FileInputStream is from the older java.io package, not NIO.2 (java.nio.file)." }
    ]
  },

  // =====================================================================
  // CHAPTER 7 — Lambda Expressions
  // =====================================================================
  {
    id: 7,
    title: "Lambda Expressions",
    description: "Functional interfaces, lambda syntax, method references, and the java.util.function package.",
    steps: [
      {
        type: "lesson",
        content: `<p>A <strong>lambda expression</strong> is a concise way to represent an anonymous function. It enables functional programming in Java.</p>
  <p><strong>Syntax:</strong> <code>(parameters) -> { body }</code></p>
  <div class="code-block">
  <span class="comment">// Before (anonymous inner class)</span>
  <span class="type">Comparator</span>&lt;<span class="type">String</span>&gt; c = <span class="keyword">new</span> <span class="type">Comparator</span>&lt;&gt;() {
    <span class="keyword">public</span> <span class="type">int</span> compare(String a, String b) {
      <span class="keyword">return</span> a.length() - b.length();
    }
  };
  
  <span class="comment">// After (lambda)</span>
  <span class="type">Comparator</span>&lt;<span class="type">String</span>&gt; c = (a, b) -> a.length() - b.length();
  </div>`
      },
      {
        type: "question",
        question: "What is a <strong>functional interface</strong>?",
        options: [
          "An interface with any number of methods",
          "An interface with exactly one abstract method",
          "A class that implements Runnable",
          "An interface with only default methods"
        ],
        correct: 1,
        explanation: "A functional interface has exactly one abstract method (SAM — Single Abstract Method). It can have multiple default/static methods."
      },
      {
        type: "lesson",
        content: `<p><strong>Common functional interfaces</strong> (in <code>java.util.function</code>):</p>
  <ul>
    <li><code>Predicate&lt;T&gt;</code> — <code>boolean test(T)</code></li>
    <li><code>Function&lt;T,R&gt;</code> — <code>R apply(T)</code></li>
    <li><code>Consumer&lt;T&gt;</code> — <code>void accept(T)</code></li>
    <li><code>Supplier&lt;T&gt;</code> — <code>T get()</code></li>
    <li><code>UnaryOperator&lt;T&gt;</code> — <code>T apply(T)</code> (Function where input=output)</li>
    <li><code>BinaryOperator&lt;T&gt;</code> — <code>T apply(T, T)</code></li>
  </ul>`
      },
      {
        type: "question",
        question: "Which functional interface would you use to filter a list (return true/false)?",
        options: ["Function", "Consumer", "Predicate", "Supplier"],
        correct: 2,
        explanation: "Predicate<T> takes an input and returns boolean — perfect for filtering."
      },
      {
        type: "lesson",
        content: `<p><strong>Method references</strong> — even shorter syntax for lambdas that just call a method:</p>
  <div class="code-block">
  list.forEach(item -> System.out.println(item));
  list.forEach(System.out::println);           <span class="comment">// static method reference</span>
  
  list.stream().map(item -> item.toUpperCase());
  list.stream().map(String::toUpperCase);       <span class="comment">// instance method on parameter</span>
  
  list.stream().map(item -> <span class="keyword">new</span> <span class="type">StringBuilder</span>(item));
  list.stream().map(StringBuilder::<span class="keyword">new</span>);              <span class="comment">// constructor reference</span>
  </div>`
      },
      {
        type: "question",
        question: "What does <code>String::toUpperCase</code> represent?",
        options: [
          "A static method reference",
          "An instance method reference on a parameter",
          "A constructor reference",
          "An arbitrary object method reference"
        ],
        correct: 1,
        explanation: "String::toUpperCase is a reference to an instance method of a class, where the instance is a stream element."
      },
      {
        type: "lesson",
        content: `<p><strong>Variable capture</strong>: lambdas can capture (use) variables from the enclosing scope.</p>
  <ul>
    <li>Must be <strong>effectively final</strong> — not reassigned after initialization</li>
    <li>Same rule as anonymous inner classes (Java 8 relaxed from explicitly final to effectively final)</li>
  </ul>`
      },
      {
        type: "question",
        question: "Can a lambda modify a local variable from the enclosing scope?",
        options: [
          "Yes, always",
          "No — the variable must be effectively final",
          "Only if it's a primitive",
          "Only inside a for loop"
        ],
        correct: 1,
        explanation: "Lambdas can only capture effectively final variables. You cannot reassign the variable inside the lambda or after capture."
      }
    ],
    quiz: [
      { question: "What annotation is commonly used to mark functional interfaces?", options: ["@Override", "@FunctionalInterface", "@SAM", "@Lambda"], correct: 1, explanation: "@FunctionalInterface is optional but recommended — the compiler checks it's a valid functional interface." },
      { question: "How many abstract methods can a functional interface have?", options: ["Any number", "Exactly one", "At least one", "Zero"], correct: 1, explanation: "A functional interface must have exactly one abstract method (plus any number of default/static methods)." },
      { question: "Which is a valid lambda expression?", options: ["() -> 42", "int x -> x + 1", "(int x, y) -> x + y", "x, y -> x + y"], correct: 0, explanation: "() -> 42 is valid: no parameters, returns 42. Others have syntax errors (missing parentheses, missing type)." },
      { question: "What does <code>Supplier&lt;String&gt;</code> do?", options: ["Takes a String, returns nothing", "Takes nothing, returns a String", "Takes and returns a String", "Tests a String condition"], correct: 1, explanation: "Supplier<T> represents a function that supplies a value: no input, one output." },
      { question: "What is the lambda equivalent of <code>new Thread(() -> System.out.println(\"Hi\"))</code>?", options: ["Runnable lambda", "Callable lambda", "Consumer lambda", "Supplier lambda"], correct: 0, explanation: "Thread takes a Runnable — which is a functional interface with <code>void run()</code>." }
    ]
  },

  // =====================================================================
  // CHAPTER 8 — Streams API
  // =====================================================================
  {
    id: 8,
    title: "Streams API",
    description: "Intermediate and terminal operations, collectors, Optional, and parallel streams.",
    steps: [
      {
        type: "lesson",
        content: `<p>A <strong>Stream</strong> is a sequence of elements supporting sequential and parallel aggregate operations.</p>
  <p>Key characteristics:</p>
  <ul>
    <li>Not a data structure — carries values from a source (collection, array, generator)</li>
    <li>Lazy — intermediate operations are not executed until a terminal operation is called</li>
    <li>Consumable — a stream can be used only once</li>
    <li>Don't modify the source</li>
  </ul>`
      },
      {
        type: "question",
        question: "Can a Stream be reused after a terminal operation?",
        options: [
          "Yes — streams are reusable by default",
          "No — a stream is consumed after a terminal operation",
          "Only if you call reset()",
          "Only for parallel streams"
        ],
        correct: 1,
        explanation: "A stream is consumed after a terminal operation. Trying to reuse it throws IllegalStateException."
      },
      {
        type: "lesson",
        content: `<p><strong>Intermediate operations</strong> (return a stream):</p>
  <ul>
    <li><code>filter(Predicate)</code> — keep elements matching the predicate</li>
    <li><code>map(Function)</code> — transform each element</li>
    <li><code>flatMap(Function)</code> — flatten nested streams</li>
    <li><code>distinct()</code> — remove duplicates</li>
    <li><code>sorted()</code> — sort elements</li>
    <li><code>peek(Consumer)</code> — perform action (debugging)</li>
    <li><code>limit(n)</code> — truncate</li>
    <li><code>skip(n)</code> — discard first n</li>
  </ul>`
      },
      {
        type: "question",
        question: "What's the difference between <code>map</code> and <code>flatMap</code>?",
        options: [
          "They are the same",
          "map is one-to-one; flatMap is one-to-many (flattens nested streams)",
          "map transforms; flatMap filters",
          "flatMap only works on lists"
        ],
        correct: 1,
        explanation: "map transforms each element to one output. flatMap transforms each element to a Stream and flattens the results."
      },
      {
        type: "lesson",
        content: `<p><strong>Terminal operations</strong> (produce a result or side effect):</p>
  <ul>
    <li><code>collect(Collector)</code> — accumulate into a collection</li>
    <li><code>toList()</code> (Java 16+) — collect into a List</li>
    <li><code>forEach(Consumer)</code> — perform action on each</li>
    <li><code>reduce(BinaryOperator)</code> — combine elements</li>
    <li><code>count()</code> — count elements</li>
    <li><code>anyMatch(Predicate)</code> / <code>allMatch</code> / <code>noneMatch</code></li>
    <li><code>findFirst()</code> / <code>findAny()</code></li>
    <li><code>min(Comparator)</code> / <code>max(Comparator)</code></li>
  </ul>`
      },
      {
        type: "question",
        question: "What does <code>numbers.stream().reduce(0, Integer::sum)</code> do?",
        options: [
          "Returns the product of all numbers",
          "Returns the sum of all numbers with 0 as the identity",
          "Counts the numbers",
          "Finds the maximum"
        ],
        correct: 1,
        explanation: "reduce(identity, accumulator) combines elements. Here it sums them: 0 + 1 + 2 + ..."
      },
      {
        type: "lesson",
        content: `<p><strong>Collectors</strong> (from <code>Collectors</code> utility class):</p>
  <div class="code-block">
  <span class="comment">// Grouping</span>
  <span class="type">Map</span>&lt;<span class="type">Department</span>, <span class="type">List</span>&lt;<span class="type">Employee</span>&gt;&gt; byDept = 
    employees.stream().collect(<span class="type">Collectors</span>.groupingBy(Employee::getDept));
  
  <span class="comment">// Partitioning (true/false)</span>
  <span class="type">Map</span>&lt;<span class="type">Boolean</span>, <span class="type">List</span>&lt;<span class="type">Integer</span>&gt;&gt; evenOdd = 
    numbers.stream().collect(<span class="type">Collectors</span>.partitioningBy(n -> n % <span class="number">2</span> == <span class="number">0</span>));
  
  <span class="comment">// Joining Strings</span>
  <span class="type">String</span> joined = names.stream().collect(<span class="type">Collectors</span>.joining(<span class="string">", "</span>));
  </div>`
      },
      {
        type: "lesson",
        content: `<p><strong>Optional</strong> — a container that may or may not contain a value. It helps avoid NullPointerException.</p>
  <div class="code-block">
  <span class="type">Optional</span>&lt;<span class="type">String</span>&gt; result = findUser(id);     <span class="comment">// may be empty</span>
  result.map(User::getName).orElse(<span class="string">"Unknown"</span>);
  result.orElseThrow(() -> <span class="keyword">new</span> <span class="type">NotFoundException</span>());
  </div>
  <p><strong>Parallel streams</strong> — <code>list.parallelStream()</code> or <code>stream.parallel()</code> splits work across threads using the common ForkJoinPool.</p>`
      },
      {
        type: "question",
        question: "What does <code>opt.orElseGet(() -> computeExpensive())</code> do vs <code>orElse()</code>?",
        options: [
          "Same thing",
          "orElseGet takes a Supplier (lazy); orElse takes a value (always evaluated)",
          "orElseGet returns an Optional; orElse returns the value",
          "orElseGet is for primitive types only"
        ],
        correct: 1,
        explanation: "orElseGet is lazy — the supplier is only called if the Optional is empty. orElse always evaluates the argument."
      }
    ],
    quiz: [
      { question: "Which is a terminal operation?", options: ["filter", "map", "collect", "distinct"], correct: 2, explanation: "collect is terminal. filter, map, and distinct are intermediate (lazy)." },
      { question: "What does <code>Stream.of(1,2,3).map(i -> i * 2).count()</code> return?", options: ["2", "3", "6", "12"], correct: 1, explanation: "count() returns the number of elements — 3 in this case. The map transforms them but doesn't change the count." },
      { question: "What is the identity value for <code>reduce</code> in multiplication?", options: ["0", "1", "-1", "Depends on the type"], correct: 1, explanation: "The identity for multiplication is 1 (x * 1 = x). An identity must satisfy: accumulator(identity, x) = x." },
      { question: "Which collector would you use to separate elements into two groups (true/false)?", options: ["groupingBy", "partitioningBy", "toMap", "teeing"], correct: 1, explanation: "partitioningBy splits into a Map<Boolean, List> based on a Predicate." },
      { question: "How do you get a parallel stream from a list?", options: ["list.parallel()", "list.parallelStream()", "Stream.parallel(list)", "list.stream(true)"], correct: 1, explanation: "Collection.parallelStream() creates a parallel stream. Stream.parallel() converts an existing stream to parallel." }
    ]
  },

  // =====================================================================
  // CHAPTER 9 — Concurrency
  // =====================================================================
  {
    id: 9,
    title: "Concurrency",
    description: "Threads, synchronization, locks, ExecutorService, CompletableFuture, and concurrent collections.",
    steps: [
      {
        type: "lesson",
        content: `<p><strong>Concurrency</strong> means multiple tasks executing in overlapping time periods.</p>
  <p><strong>Creating threads:</strong></p>
  <div class="code-block">
  <span class="comment">// Extending Thread</span>
  <span class="keyword">class</span> <span class="type">MyThread</span> <span class="keyword">extends</span> <span class="type">Thread</span> {
    <span class="keyword">public void</span> run() { ... }
  }
  
  <span class="comment">// Implementing Runnable (preferred — more flexible)</span>
  <span class="keyword">new</span> <span class="type">Thread</span>(() -> { ... }).start();
  
  <span class="comment">// Callable — returns a value, can throw</span>
  <span class="type">Callable</span>&lt;<span class="type">Integer</span>&gt; task = () -> compute();
  </div>`
      },
      {
        type: "question",
        question: "What is a key difference between <code>Runnable</code> and <code>Callable</code>?",
        options: [
          "Runnable is faster",
          "Callable can return a value and throw checked exceptions; Runnable cannot",
          "Callable runs on the main thread",
          "Runnable is an interface; Callable is a class"
        ],
        correct: 1,
        explanation: "Callable<V> returns a value and can throw checked exceptions. Runnable's run() returns void and cannot throw checked exceptions."
      },
      {
        type: "lesson",
        content: `<p><strong>Thread safety</strong> — preventing data races and inconsistent state:</p>
  <ul>
    <li><code>synchronized</code> — intrinsic locks (mutual exclusion)</li>
    <li><code>volatile</code> — ensures visibility across threads (no caching)</li>
    <li><code>Lock</code> / <code>ReentrantLock</code> — more flexible than synchronized</li>
  </ul>
  <div class="code-block">
  <span class="keyword">synchronized</span>(<span class="keyword">this</span>) {
    <span class="comment">// critical section — only one thread at a time</span>
  }
  </div>`
      },
      {
        type: "question",
        question: "What does <code>volatile</code> guarantee?",
        options: [
          "Atomicity of compound operations",
          "Visibility — changes are immediately visible to other threads",
          "Mutual exclusion",
          "Faster execution"
        ],
        correct: 1,
        explanation: "volatile guarantees visibility (happens-before relationship). It does NOT guarantee atomicity for compound operations like i++."
      },
      {
        type: "lesson",
        content: `<p><strong>ExecutorService</strong> — higher-level replacement for managing threads:</p>
  <div class="code-block">
  <span class="type">ExecutorService</span> pool = <span class="type">Executors</span>.newFixedThreadPool(<span class="number">4</span>);
  <span class="type">Future</span>&lt;<span class="type">Integer</span>&gt; result = pool.submit(callableTask);
  <span class="type">Integer</span> value = result.get();              <span class="comment">// blocks until done</span>
  pool.shutdown();
  </div>
  <p>Thread pool types: <code>fixedThreadPool</code>, <code>cachedThreadPool</code>, <code>singleThreadExecutor</code>, <code>scheduledThreadPool</code></p>`
      },
      {
        type: "question",
        question: "What does <code>ExecutorService.shutdown()</code> do?",
        options: [
          "Immediately terminates all running tasks",
          "Prevents new tasks from being submitted; already submitted tasks complete",
          "Pauses the thread pool",
          "Restarts all threads"
        ],
        correct: 1,
        explanation: "shutdown() initiates an orderly shutdown — no new tasks accepted, but already submitted tasks run to completion. shutdownNow() attempts to stop running tasks."
      },
      {
        type: "lesson",
        content: `<p><strong>CompletableFuture</strong> (Java 8+) — asynchronous programming with a fluent API:</p>
  <div class="code-block">
  <span class="type">CompletableFuture</span>
    .supplyAsync(() -> fetchData())
    .thenApply(data -> process(data))
    .thenAccept(result -> System.out.println(result))
    .exceptionally(e -> { log(e); <span class="keyword">return</span> <span class="keyword">null</span>; });
  </div>
  <p><strong>Concurrent collections</strong>:</p>
  <ul>
    <li><code>ConcurrentHashMap</code> — high-concurrency map (Java 5+)</li>
    <li><code>CopyOnWriteArrayList</code> — thread-safe list (iterate without locking)</li>
    <li><code>BlockingQueue</code> — thread-safe queue (producer-consumer)</li>
  </ul>`
      },
      {
        type: "question",
        question: "What does <code>CompletableFuture.completeExceptionally()</code> do?",
        options: [
          "Completes the future successfully",
          "Completes the future with an exception, triggering exceptionally()",
          "Cancels the future",
          "Throws immediately on the calling thread"
        ],
        correct: 1,
        explanation: "completeExceptionally() completes the future exceptionally, causing downstream stages to handle the exception."
      }
    ],
    quiz: [
      { question: "What problem does <code>synchronized</code> solve?", options: ["Visibility only", "Atomicity only", "Both visibility and atomicity", "Neither"], correct: 2, explanation: "synchronized provides both mutual exclusion (atomicity) and a happens-before guarantee (visibility)." },
      { question: "Which ExecutorService uses an unbounded queue with a fixed number of threads?", options: ["newCachedThreadPool", "newFixedThreadPool", "newSingleThreadExecutor", "newScheduledThreadPool"], correct: 1, explanation: "newFixedThreadPool uses a fixed number of threads and an unbounded LinkedBlockingQueue." },
      { question: "What does <code>Future.get()</code> do?", options: ["Returns immediately", "Blocks until the result is available", "Cancels the task", "Returns null if not done"], correct: 1, explanation: "get() blocks until the computation completes, then returns the result (or throws if exceptional)." },
      { question: "Which concurrent collection is best for a read-heavy, write-rarely scenario with iteration?", options: ["ConcurrentHashMap", "CopyOnWriteArrayList", "Collections.synchronizedList", "Hashtable"], correct: 1, explanation: "CopyOnWriteArrayList is ideal when traversals vastly outnumber mutations — iteration uses a snapshot of the underlying array." },
      { question: "What is a deadlock?", options: ["A thread that never starts", "Two+ threads waiting forever for locks each other holds", "A synchronized block with no exit", "A thread that executes too slowly"], correct: 1, explanation: "Deadlock occurs when each thread holds a lock the other needs and neither releases." }
    ]
  },

  // =====================================================================
  // CHAPTER 10 — Modern Java (9–21)
  // =====================================================================
  {
    id: 10,
    title: "Modern Java (9–21)",
    description: "Records, sealed classes, pattern matching, text blocks, switch expressions, and other modern features.",
    steps: [
      {
        type: "lesson",
        content: `<p>Java has evolved rapidly. Key features from recent versions:</p>
  <p><strong>Java 9:</strong> Module system (JPMS), <code>List.of()</code>, <code>Set.of()</code>, <code>Map.of()</code>, private interface methods.</p>
  <p><strong>Java 10:</strong> Local variable type inference (<code>var</code>).</p>
  <p><strong>Java 11:</strong> <code>String.repeat()</code>, <code>Files.readString()</code>, <code>Files.writeString()</code>, HTTP Client (standard).</p>`
      },
      {
        type: "question",
        question: "What does <code>var</code> do in Java 10+?",
        options: [
          "Creates a dynamically-typed variable",
          "Infers the type from the initializer — still statically typed",
          "Makes a variable mutable",
          "Declares a variant type"
        ],
        correct: 1,
        explanation: "var infers the compile-time type from the initializer. The variable is still statically typed — you just don't write the type."
      },
      {
        type: "lesson",
        content: `<p><strong>Records</strong> (Java 16) — transparent carriers for immutable data. Compiler generates constructor, accessors, equals, hashCode, toString:</p>
  <div class="code-block">
  <span class="keyword">record</span> <span class="type">Point</span>(<span class="type">int</span> x, <span class="type">int</span> y) { }
  
  <span class="type">Point</span> p = <span class="keyword">new</span> <span class="type">Point</span>(<span class="number">3</span>, <span class="number">4</span>);
  p.x();   <span class="comment">// 3 — note: not getX(), just x()</span>
  </div>
  <p>Records are implicitly <code>final</code>, cannot extend other classes, and fields are <code>private final</code>.</p>`
      },
      {
        type: "question",
        question: "What accessors does a record generate?",
        options: [
          "getX(), getY() style getters",
          "x(), y() — component accessors matching the field names",
          "Only toString()",
          "It generates no accessors — fields are public"
        ],
        correct: 1,
        explanation: "Records generate component accessor methods with the same name as the field: point.x() not point.getX()."
      },
      {
        type: "lesson",
        content: `<p><strong>Sealed classes</strong> (Java 17) — restrict which classes can extend/implement them:</p>
  <div class="code-block">
  <span class="keyword">sealed</span> <span class="keyword">class</span> <span class="type">Shape</span> <span class="keyword">permits</span> <span class="type">Circle</span>, <span class="type">Rectangle</span> { }
  <span class="keyword">final</span> <span class="keyword">class</span> <span class="type">Circle</span> <span class="keyword">extends</span> <span class="type">Shape</span> { }
  <span class="keyword">final</span> <span class="keyword">class</span> <span class="type">Rectangle</span> <span class="keyword">extends</span> <span class="type">Shape</span> { }
  </div>`
      },
      {
        type: "lesson",
        content: `<p><strong>Pattern matching for instanceof</strong> (Java 16+) — combine type check and cast:</p>
  <div class="code-block">
  <span class="comment">// Old</span>
  <span class="keyword">if</span> (obj <span class="keyword">instanceof</span> <span class="type">String</span>) {
    <span class="type">String</span> s = (<span class="type">String</span>) obj;
  }
  
  <span class="comment">// New</span>
  <span class="keyword">if</span> (obj <span class="keyword">instanceof</span> <span class="type">String</span> s) {
    <span class="comment">// s is already a String, no cast needed</span>
  }
  </div>
  <p><strong>Switch expressions</strong> (Java 14+) — switch that returns a value:</p>
  <div class="code-block">
  <span class="type">String</span> result = <span class="keyword">switch</span> (day) {
    <span class="keyword">case</span> MONDAY, FRIDAY -> <span class="string">"Work"</span>;
    <span class="keyword">case</span> SATURDAY, SUNDAY -> <span class="string">"Rest"</span>;
    <span class="keyword">default</span> -> <span class="string">"Midweek"</span>;
  };
  </div>`
      },
      {
        type: "question",
        question: "What does a switch <strong>expression</strong> (vs statement) guarantee?",
        options: [
          "It always returns a value and must be exhaustive",
          "It doesn't need break statements",
          "It only works with enums",
          "Both A and B"
        ],
        correct: 3,
        explanation: "Switch expressions always produce a value, must be exhaustive (cover all cases), and don't fall through (no break needed)."
      },
      {
        type: "lesson",
        content: `<p><strong>Text blocks</strong> (Java 15) — multi-line strings without messy escaping:</p>
  <div class="code-block">
  <span class="type">String</span> html = <span class="string">"""
    &lt;html&gt;
      &lt;body&gt;
        &lt;p&gt;Hello, World!&lt;/p&gt;
      &lt;/body&gt;
    &lt;/html&gt;
    """</span>;
  </div>
  <p><strong>Virtual threads</strong> (Java 21 — preview in 19, 20) — lightweight threads managed by the JVM, allowing millions of concurrent tasks with simple thread-per-request code.</p>`
      },
      {
        type: "question",
        question: "What feature of Java 21 enables millions of concurrent threads?",
        options: ["Records", "Sealed classes", "Virtual threads", "Pattern matching"],
        correct: 2,
        explanation: "Virtual threads (Project Loom) are lightweight JVM-managed threads that allow high-throughput concurrent applications without complex async code."
      }
    ],
    quiz: [
      { question: "Which Java version introduced records as a final (non-preview) feature?", options: ["Java 14", "Java 15", "Java 16", "Java 17"], correct: 2, explanation: "Records were finalized in Java 16 (JEP 395)." },
      { question: "What does <code>var</code> infer at compile time?", options: ["Dynamic type", "The type from the initializer expression", "Object type", "The most specific interface"], correct: 1, explanation: "var infers the compile-time type from the right-hand side. It's still static typing." },
      { question: "What keyword restricts which classes can extend a sealed class?", options: ["extends", "permits", "allows", "restricts"], correct: 1, explanation: "The <code>permits</code> clause lists the classes allowed to extend the sealed class." },
      { question: "Which feature eliminates the need for explicit casts after instanceof checks?", options: ["Records", "Pattern matching for instanceof", "Switch expressions", "Text blocks"], correct: 1, explanation: "Pattern matching for instanceof binds the variable directly, no cast needed: <code>if (obj instanceof String s)</code>." },
      { question: "What delimiter starts and ends a text block?", options: ["'''", "\"\"\"", "`", "---"], correct: 1, explanation: "Text blocks use three double-quotes: <code>\"\"\" ... \"\"\"</code>." }
    ]
  },

  // =====================================================================
  // CHAPTER 11 — Spring Boot Basics
  // =====================================================================
  {
    id: 11,
    title: "Spring Boot Basics",
    description: "Auto-configuration, dependency injection, REST controllers, properties, and dev tools.",
    steps: [
      {
        type: "lesson",
        content: `<p><strong>Spring Boot</strong> is an opinionated framework built on Spring that simplifies configuration and deployment.</p>
  <p>Key concepts:</p>
  <ul>
    <li><strong>Auto-configuration</strong> — automatically configures beans based on dependencies on the classpath</li>
    <li><strong>Starter POMs</strong> — pre-packaged dependency groups (<code>spring-boot-starter-web</code>, <code>spring-boot-starter-data-jpa</code>)</li>
    <li><strong>Embedded server</strong> — Tomcat, Jetty, or Undertow (no WAR deployment needed)</li>
    <li><strong>@SpringBootApplication</strong> — combines @Configuration, @EnableAutoConfiguration, @ComponentScan</li>
  </ul>`
      },
      {
        type: "question",
        question: "What does <code>@SpringBootApplication</code> combine?",
        options: [
          "@Configuration + @Bean + @Autowired",
          "@Configuration + @EnableAutoConfiguration + @ComponentScan",
          "@Controller + @RequestMapping + @ResponseBody",
          "@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan"
        ],
        correct: 1,
        explanation: "@SpringBootApplication is a convenience annotation that combines @Configuration, @EnableAutoConfiguration, and @ComponentScan."
      },
      {
        type: "lesson",
        content: `<p><strong>Dependency Injection (DI)</strong> / <strong>Inversion of Control (IoC)</strong>:</p>
  <ul>
    <li>Spring manages Beans (objects) in the ApplicationContext</li>
    <li>Beans are wired together via injection</li>
    <li>Injection methods: field (<code>@Autowired</code>), constructor (preferred), setter</li>
  </ul>
  <div class="code-block">
  <span class="keyword">@Service</span>
  <span class="keyword">public class</span> <span class="type">UserService</span> {
    <span class="keyword">private final</span> <span class="type">UserRepository</span> repo;
    
    <span class="keyword">public</span> UserService(<span class="type">UserRepository</span> repo) {  <span class="comment">// constructor injection</span>
      <span class="keyword">this</span>.repo = repo;
    }
  }
  </div>`
      },
      {
        type: "question",
        question: "Which injection method does Spring recommend?",
        options: ["Field injection (@Autowired on field)", "Constructor injection", "Setter injection", "Method injection"],
        correct: 1,
        explanation: "Constructor injection is recommended — it ensures immutability, makes dependencies explicit, and works better with testing."
      },
      {
        type: "lesson",
        content: `<p><strong>REST Controller:</strong></p>
  <div class="code-block">
  <span class="keyword">@RestController</span>
  <span class="keyword">@RequestMapping</span>(<span class="string">"/api/users"</span>)
  <span class="keyword">public class</span> <span class="type">UserController</span> {
    
    <span class="keyword">@GetMapping</span>
    <span class="keyword">public</span> <span class="type">List</span>&lt;<span class="type">User</span>&gt; getAll() { ... }
    
    <span class="keyword">@PostMapping</span>
    <span class="keyword">public</span> <span class="type">User</span> create(<span class="keyword">@RequestBody</span> <span class="type">User</span> user) { ... }
    
    <span class="keyword">@GetMapping</span>(<span class="string">"/{id}"</span>)
    <span class="keyword">public</span> <span class="type">User</span> getById(<span class="keyword">@PathVariable</span> <span class="type">Long</span> id) { ... }
  }
  </div>
  <p>@RestController = @Controller + @ResponseBody (returns JSON from methods).</p>`
      },
      {
        type: "question",
        question: "What does <code>@PathVariable</code> do in a controller?",
        options: [
          "Binds a request body to a method parameter",
          "Binds a URI template variable to a method parameter",
          "Binds a query parameter",
          "Binds a request header"
        ],
        correct: 1,
        explanation: "@PathVariable extracts values from URI template placeholders like /{id}. @RequestParam is for query parameters."
      },
      {
        type: "lesson",
        content: `<p><strong>Configuration properties</strong> — externalize configuration:</p>
  <div class="code-block">
  <span class="comment">// application.properties</span>
  server.port=<span class="number">8080</span>
  app.greeting=Hello, \${<span class="type">user</span>.name:World}!
  
  <span class="comment">// application.yml (YAML alternative)</span>
  server:
    port: <span class="number">8080</span>
  app:
    greeting: "Hello!"
  </div>
  <p><strong>@ConfigurationProperties</strong> binds properties to a POJO:</p>
  <div class="code-block">
  <span class="keyword">@ConfigurationProperties</span>(prefix = <span class="string">"app"</span>)
  <span class="keyword">public record</span> <span class="type">AppConfig</span>(<span class="type">String</span> greeting) { }
  </div>`
      },
      {
        type: "lesson",
        content: `<p><strong>Spring Boot DevTools</strong> enables:</p>
  <ul>
    <li>Automatic restart when files change (fast classloader restart)</li>
    <li>LiveReload (browser auto-refresh)</li>
    <li>Remote debugging support</li>
  </ul>
  <p><strong>Actuator</strong> adds production-ready endpoints: <code>/health</code>, <code>/metrics</code>, <code>/info</code>, <code>/env</code>, etc.</p>`
      },
      {
        type: "question",
        question: "Which dependency enables <code>/actuator/health</code> endpoint?",
        options: [
          "spring-boot-starter-web",
          "spring-boot-starter-actuator",
          "spring-boot-devtools",
          "spring-boot-starter-test"
        ],
        correct: 1,
        explanation: "spring-boot-starter-actuator adds production monitoring endpoints including /health, /metrics, and /info."
      }
    ],
    quiz: [
      { question: "What is the default embedded servlet container in Spring Boot?", options: ["Jetty", "Undertow", "Tomcat", "Netty"], correct: 2, explanation: "Spring Boot uses Tomcat by default (spring-boot-starter-web includes spring-boot-starter-tomcat)." },
      { question: "Which annotation maps HTTP POST requests to a method?", options: ["@GetMapping", "@PostMapping", "@RequestMapping(method=POST)", "Both @PostMapping and @RequestMapping(method=POST)"], correct: 3, explanation: "@PostMapping is a composed annotation for @RequestMapping(method=POST). Both work." },
      { question: "Where should you put configuration like database URLs?", options: ["In the Java code", "In application.properties or application.yml", "In pom.xml", "In a database"], correct: 1, explanation: "Externalize configuration to application.properties/yml files for environment-specific settings." },
      { question: "What is the purpose of @ComponentScan?", options: ["Creates components", "Scans packages for Spring-managed beans", "Scans for SQL queries", "Generates documentation"], correct: 1, explanation: "@ComponentScan tells Spring which packages to scan for annotated components (@Component, @Service, @Repository, etc.)." },
      { question: "What does spring-boot-devtools provide?", options: ["Database migration", "Automatic restart on code changes", "Security configuration", "Cloud deployment"], correct: 1, explanation: "DevTools provides automatic restart, LiveReload, and remote debugging support during development." }
    ]
  }
];
