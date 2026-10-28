import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Behavioral checks that stay active even without -ea or JUnit. */
public final class ExpenseReportTest {
    private static int checks;
    private static void check(boolean condition, String message) {
        checks++;
        if (!condition) throw new AssertionError(message);
    }
    private static void rejects(Runnable operation, String message) {
        checks++;
        try { operation.run(); }
        catch (IllegalArgumentException expected) { return; }
        throw new AssertionError(message);
    }
    private record Result(int status, String output, String error) { }
    private static Result run(String... args) {
        var output = new ByteArrayOutputStream();
        var errors = new ByteArrayOutputStream();
        try (var out = new PrintStream(output, true, StandardCharsets.UTF_8);
             var err = new PrintStream(errors, true, StandardCharsets.UTF_8)) {
            int status = ExpenseReport.run(args, out, err);
            return new Result(status, output.toString(StandardCharsets.UTF_8), errors.toString(StandardCharsets.UTF_8));
        }
    }
    public static void main(String[] args) throws Exception {
        check(ExpenseReport.parseAmount("0").equals(new BigDecimal("0.00")), "zero normalization");
        check(ExpenseReport.parseAmount("12.5").equals(new BigDecimal("12.50")), "scale normalization");
        for (String text : List.of("", "-1", "+1", "1.001", "NaN", "Infinity", "1e2", "1.", ".5", " 1", "1000000000", "9".repeat(21))) {
            rejects(() -> ExpenseReport.parseAmount(text), "accepted bad amount: " + text);
        }
        rejects(() -> new ExpenseReport.Expense("", BigDecimal.ONE), "blank category");
        rejects(() -> new ExpenseReport.Expense("bad\tvalue", BigDecimal.ONE), "control character");
        rejects(() -> new ExpenseReport.Expense("x", new BigDecimal("1.001")), "record precision");
        check(ExpenseReport.summarize(List.of()).isEmpty(), "empty aggregation");
        var totals = ExpenseReport.summarize(List.of(new ExpenseReport.Expense("books", new BigDecimal("0.10")), new ExpenseReport.Expense("books", new BigDecimal("0.20"))));
        check(totals.get("books").equals(new BigDecimal("0.30")), "exact decimal aggregation");
        Path directory = Files.createTempDirectory("expense-tests-");
        Path file = directory.resolve("expenses.tsv");
        try {
            Files.writeString(file, "category\tamount\ntravel\t20.00\nbooks\t12.50\nbooks\t7.25\n", StandardCharsets.UTF_8);
            Result valid = run(file.toString());
            check(valid.status() == 0, "valid status");
            check(valid.output().replace("\r\n", "\n").equals("books: 19.75\ntravel: 20.00\n"), "sorted totals");
            check(valid.error().isEmpty(), "no success diagnostic");
            Files.writeString(file, "category\tamount\r\ncafé\t1.00\r\n", StandardCharsets.UTF_8);
            check(run(file.toString()).output().contains("café: 1.00"), "Unicode and CRLF");
            Files.writeString(file, "category\tamount\n", StandardCharsets.UTF_8);
            check(run(file.toString()).status() == 0 && run(file.toString()).output().isEmpty(), "header only");
            for (String content : List.of("", "amount\tcategory\n", "category\tamount\n\n", "category\tamount\nbooks\n", "category\tamount\n\t2\n", "category\tamount\nbooks\t1\textra\n", "category\tamount\nbooks\t1\ntravel\tbad\n", "category\tamount\n" + "x".repeat(300))) {
                Files.writeString(file, content, StandardCharsets.UTF_8);
                Result invalid = run(file.toString());
                check(invalid.status() == 1, "bad input status");
                check(invalid.output().isEmpty(), "no partial output");
                check(!invalid.error().isEmpty(), "useful error");
            }
            Files.write(file, new byte[]{(byte)0xff});
            check(run(file.toString()).status() == 1, "invalid UTF-8");
            check(run(directory.resolve("missing.tsv").toString()).status() == 1, "missing file");
            check(run().status() == 2, "missing argument");
            check(run("a", "b").status() == 2, "extra argument");
        } finally {
            Files.deleteIfExists(file);
            Files.deleteIfExists(directory);
        }
        System.out.println("ExpenseReportTest passed: " + checks + " checks");
    }
}
