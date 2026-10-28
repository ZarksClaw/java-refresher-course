import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** A constrained UTF-8 TSV expense-report CLI. JDK 21+, no third-party dependencies. */
public final class ExpenseReport {
    static final long MAX_FILE_BYTES = 10_000_000;
    static final int MAX_ROWS = 100_000;
    static final int MAX_LINE_CHARS = 256;
    static final BigDecimal MAX_AMOUNT = new BigDecimal("999999999.99");

    public record Expense(String category, BigDecimal amount) {
        public Expense {
            if (category == null || category.isBlank() || category.length() > 100
                    || category.codePoints().anyMatch(Character::isISOControl)) {
                throw new IllegalArgumentException("category must be 1..100 characters without control characters");
            }
            category = category.strip();
            if (amount == null || amount.signum() < 0 || amount.compareTo(MAX_AMOUNT) > 0) {
                throw new IllegalArgumentException("amount out of range");
            }
            try {
                amount = amount.setScale(2, RoundingMode.UNNECESSARY);
            } catch (ArithmeticException error) {
                throw new IllegalArgumentException("amount must be exactly representable in cents", error);
            }
        }
    }

    static BigDecimal parseAmount(String text) {
        if (text == null || text.length() > 20 || !text.matches("[0-9]+(?:\\.[0-9]{1,2})?")) {
            throw new IllegalArgumentException("amount must be unsigned decimal text with at most two fractional digits");
        }
        BigDecimal amount = new BigDecimal(text).setScale(2, RoundingMode.UNNECESSARY);
        if (amount.compareTo(MAX_AMOUNT) > 0) throw new IllegalArgumentException("amount exceeds per-record limit");
        return amount;
    }

    // Read incrementally so a single malformed huge line cannot require a huge String.
    static String readBoundedLine(BufferedReader reader) throws IOException {
        var line = new StringBuilder();
        int character;
        while ((character = reader.read()) != -1) {
            if (character == '\n') return stripCarriageReturn(line);
            if (line.length() >= MAX_LINE_CHARS) throw new IllegalArgumentException("line exceeds length limit");
            line.append((char) character);
        }
        return line.isEmpty() ? null : stripCarriageReturn(line);
    }

    private static String stripCarriageReturn(StringBuilder line) {
        if (!line.isEmpty() && line.charAt(line.length() - 1) == '\r') line.setLength(line.length() - 1);
        return line.toString();
    }

    static List<Expense> readExpenses(Path path) throws IOException {
        if (Files.size(path) > MAX_FILE_BYTES) throw new IllegalArgumentException("file exceeds 10 MB limit");
        var expenses = new ArrayList<Expense>();
        try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String header = readBoundedLine(reader);
            if (!"category\tamount".equals(header)) throw new IllegalArgumentException("expected category<TAB>amount header");
            String line;
            int lineNumber = 1;
            while ((line = readBoundedLine(reader)) != null) {
                lineNumber++;
                if (expenses.size() >= MAX_ROWS) throw new IllegalArgumentException("file exceeds record limit");
                String[] columns = line.split("\t", -1);
                if (columns.length != 2) throw new IllegalArgumentException("line " + lineNumber + ": expected two tab-separated columns");
                try {
                    expenses.add(new Expense(columns[0], parseAmount(columns[1])));
                } catch (IllegalArgumentException error) {
                    throw new IllegalArgumentException("line " + lineNumber + ": " + error.getMessage(), error);
                }
            }
        }
        return List.copyOf(expenses);
    }

    static Map<String, BigDecimal> summarize(List<Expense> expenses) {
        var totals = new TreeMap<String, BigDecimal>();
        for (var expense : expenses) totals.merge(expense.category(), expense.amount(), BigDecimal::add);
        return totals;
    }

    static int run(String[] args, PrintStream output, PrintStream errors) {
        if (args.length != 1) {
            errors.println("usage: ExpenseReport <expenses.tsv>");
            return 2;
        }
        final Map<String, BigDecimal> totals;
        try {
            totals = summarize(readExpenses(Path.of(args[0])));
        } catch (IOException | IllegalArgumentException error) {
            errors.println("error: " + error.getMessage());
            return 1;
        }
        totals.forEach((category, amount) -> output.println(category + ": " + amount.toPlainString()));
        if (output.checkError()) {
            errors.println("error: could not write report output");
            return 1;
        }
        return 0;
    }

    public static void main(String[] args) {
        System.exit(run(args, System.out, System.err));
    }
}
