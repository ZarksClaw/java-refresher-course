# Expense report capstone

JDK 21+, no Maven, database, network, or third-party dependencies. From the repository root:

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

The harness uses explicit checks and throws AssertionError on failure; it does not
require `-ea`. Course snippets use Java assertions and do require `-ea`.

## File contract

This is constrained UTF-8 tab-separated text, **not general CSV or a quoted TSV parser**.
The first line must be exactly `category<TAB>amount`, with a literal tab separator.
Each following physical line has exactly two columns. LF and CRLF are accepted.
Quoting, embedded tabs/newlines, blank records, and a UTF-8 BOM are not supported.
A header-only file is valid; an empty file is not. A final newline is optional.

Categories are stripped of surrounding whitespace, case-sensitive, and limited to
100 characters before stripping, with no ISO control characters. Amounts use
unsigned decimal text, digits before the decimal point, and at most two fractional
digits. No spaces, sign, exponent, NaN, Infinity, or silent rounding. Zero is valid;
amounts are at most 999999999.99. Totals use exact BigDecimal addition and sorted
category order.

Limits: initial file size 10 MB, 100,000 records, 256 UTF-16 code units per line,
and 20 characters per amount. Lines are read with a bound before materialization.
The initial size check is for a local input file; this is not a hardened upload
handler for files that change concurrently. The validated records are held in memory.

Success writes totals to stdout and returns 0. Input errors write a diagnostic to
stderr, return 1, and print no partial report. Argument usage errors return 2.
Output write errors also return 1, although an output device can already have
received a partial report before failing. The tool never modifies input files.

## Boundaries and extensions

`parseAmount` validates money text; the Expense record enforces record invariants;
`readExpenses` validates the file; `summarize` aggregates without I/O; `run` owns
stdout/stderr and statuses. `main` only passes the status to the operating system.

Try adding JSON output with explicit decimal serialization, date filtering, a JDBC
adapter, or Maven packaging. Define each extension's behavior and failure cases
before implementation. For real CSV support, add a maintained CSV library rather
than extending delimiter splitting with ad hoc quoting rules.
