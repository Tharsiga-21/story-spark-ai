import { stripHtmlTags, truncate, normalizeWhitespace } from "../sanitization";

describe("stripHtmlTags", () => {
  it("removes complete HTML tags", () => {
    expect(stripHtmlTags("<p>Hello <strong>World</strong></p>")).toBe("Hello World");
  });

  it("removes incomplete tag openers", () => {
    expect(stripHtmlTags("Click <script>alert('xss')</script>")).toBe(
      "Click alert('xss')"
    );
  });

  it("returns empty string for empty input", () => {
    expect(stripHtmlTags("")).toBe("");
  });

  it("returns empty string for null/undefined", () => {
    expect(stripHtmlTags(null as any)).toBe("");
    expect(stripHtmlTags(undefined as any)).toBe("");
  });

  it("handles nested tags", () => {
    expect(stripHtmlTags("<div><span><p>Text</p></span></div>")).toBe("Text");
  });

  it("handles text with no tags", () => {
    expect(stripHtmlTags("Plain text without tags")).toBe("Plain text without tags");
  });

  it("removes self-closing tags", () => {
    expect(stripHtmlTags("Image <img src='x'/> here")).toBe("Image  here");
  });
});

describe("truncate", () => {
  it("truncates long strings with default suffix", () => {
    const result = truncate("This is a very long string that should be truncated", 20);
    expect(result).toBe("This is a very lo...");
    expect(result.length).toBe(20);
  });

  it("truncates with custom suffix", () => {
    const result = truncate("Hello World", 5, "...");
    expect(result).toBe("He...");
  });

  it("returns string unchanged when shorter than maxLength", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });

  it("returns empty string for empty input", () => {
    expect(truncate("", 10)).toBe("");
  });

  it("returns empty string for null/undefined", () => {
    expect(truncate(null as any, 10)).toBe("");
    expect(truncate(undefined as any, 10)).toBe("");
  });

  it("handles maxLength of zero", () => {
    const result = truncate("Hello", 0);
    expect(result).toBe("");
  });

  it("handles suffix longer than maxLength", () => {
    const result = truncate("Hello", 3, "...");
    expect(result).toBe("...");
  });
});

describe("normalizeWhitespace", () => {
  it("collapses multiple spaces to one", () => {
    expect(normalizeWhitespace("Hello    World")).toBe("Hello World");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeWhitespace("   Hello   ")).toBe("Hello");
  });

  it("collapses tabs and newlines", () => {
    expect(normalizeWhitespace("Hello\t\nWorld")).toBe("Hello World");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeWhitespace("")).toBe("");
  });

  it("returns empty string for whitespace-only", () => {
    expect(normalizeWhitespace("   \t\n  ")).toBe("");
  });

  it("returns empty string for null/undefined", () => {
    expect(normalizeWhitespace(null as any)).toBe("");
    expect(normalizeWhitespace(undefined as any)).toBe("");
  });

  it("handles mixed whitespace", () => {
    expect(normalizeWhitespace("  Hello   \n\t  World  ")).toBe("Hello World");
  });
});
