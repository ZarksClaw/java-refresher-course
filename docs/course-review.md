# Java course review and expansion

The original course has a useful static format, immediate question feedback, and
local progress tracking. This change preserves those properties while increasing
explanation depth and adding practice and engineering coverage.

## Findings addressed

| Finding | Correction or expansion |
|---------|-------------------------|
| Mostly short definitions and quizzes | Added explicit goals, deeper edge cases, and a worked practice lab per chapter |
| No integrated runnable project | Added an offline JDK-only expense CLI with exact money and behavioral checks |
| Missing testing, diagnostics, delivery, HTTP, and database depth | Added 12 Engineering chapters |
| Unused uninitialized local declaration labeled a compiler error | Clarified that reading before definite assignment fails; declaration alone is legal |
| String operations claimed to always allocate new strings | Distinguished immutability from allocation/reuse |
| char described as a whole Unicode character | Clarified UTF-16 code units and code-point counting |
| Comparator subtracts ages | Used comparingInt to avoid overflow |
| LinkedList described as automatically fast for arbitrary middle insertion | Distinguished traversal from mutation at an existing iterator position |
| Every map key said to require overriding equals/hashCode | Scoped that requirement to custom value equality; inherited identity semantics are valid |
| Generic types in some options parsed as HTML | Escaped the Java generic syntax |
| PECS described as read-only immutability | Distinguished add restrictions from other supported mutations |
| Error described as uncatchable | Clarified it is catchable but normally not safely recoverable |
| FileReader charset support outdated | Explained Java 11+ charset constructors and the explicit stream bridge |
| Files.walk/lines resource ownership omitted | Added try-with-resources and resource lifetime explanations |
| System.out::println labeled static | Corrected to a bound instance method reference |
| Lambda capture confused mutation and rebinding | Explained effectively-final references can still point to mutable objects |
| Optional of String mapped with a User accessor | Corrected the illustrative Optional element type |
| Fixed-pool assessment had multiple plausible choices | Asked for exactly four platform workers with an unbounded queue |
| Record components presented as deeply immutable | Explained shallow immutability and defensive copying |
| Switch expressions said never to fall through | Scoped no-fallthrough to arrow rules; explained exhaustive value-or-throw behavior |
| SpringBootApplication assessment selected the indirect annotation set | Corrected the directly declared SpringBootConfiguration combination |
| Constructor injection claimed to ensure immutability | Limited claim to explicit dependencies and final references |
| ConfigurationProperties record lacked registration guidance | Added ConfigurationPropertiesScan/EnableConfigurationProperties requirements |
| REST responses implied JSON regardless of converters | Added converter/content-negotiation qualification |
| Actuator dependency implied all endpoints exposed | Distinguished availability, exposure, and management security |
| Reset retained in-memory answers | Clear session answers together with stored progress |
| Larger course lacked discovery controls | Added search, tracks, goals, unlocked outline, and keyboard-accessible cards |
| Old assessment passes survived curriculum changes | Added revision-aware invalidation while retaining completed original positions |
| Storage failures could interrupt learning | Added session fallback and a storage notice |

## Verification and limits

New runnable snippets carry metadata used to compile them against Java 21 and run
them with assertions enabled. The capstone uses a separate explicit-check harness
covering exact totals, bad values and rows, Unicode, CRLF, encoding failures,
missing files, bounded lines, and output/status behavior. Browser smoke checks are
configured for the entire course flow and small-screen widths.

Original introductory fragments, Spring/JDBC/JUnit integration sketches, module
configuration, and Maven commands are not standalone applications and are not
claimed as executed integration tests. Network calls are not made by the offline
checks. No preview Java APIs or automatic code grading are required.

Java 21 is a stable teaching baseline. Spring examples are scoped to Boot 3.x
Servlet/Jakarta conventions, not a support-lifecycle recommendation. This remains
a refresher rather than a full Spring project or comprehensive production security
course. Practice labs are self-assessed.
