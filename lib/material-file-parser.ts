// Client-side material file parsing.
// Extracts plain text from text files, PDFs, and DOCX entirely in the browser.
// No binary is ever uploaded to a server. PDFs are parsed for selectable text
// only — there is no OCR and no page rendering.

export interface ParsedMaterialFile {
  content: string;
  fileName: string;
  fileType: string;
  truncated: boolean;
  warning?: string;
}

// ─── Limits ──────────────────────────────────────────────────────────────────
const TEXT_MAX_BYTES = 500 * 1024; // 500 KB for text formats
const BINARY_MAX_BYTES = 5 * 1024 * 1024; // 5 MB for PDF/DOCX
const PDF_PAGE_LIMIT = 150; // never read past 150 pages
const EXTRACTED_TEXT_LIMIT = 200_000; // characters

const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".html"] as const;
type TextExtension = (typeof TEXT_EXTENSIONS)[number];

const CANONICAL_MIME: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".json": "application/json",
  ".html": "text/html",
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export class MaterialParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialParseError";
  }
}

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return "";
  return fileName.slice(dot).toLowerCase();
}

function isTextExtension(ext: string): ext is TextExtension {
  return (TEXT_EXTENSIONS as readonly string[]).includes(ext);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Normalize line endings and collapse excessive blank lines.
function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
async function extractPdf(
  file: File
): Promise<{ text: string; warning?: string }> {
  const pdfjs = await import("pdfjs-dist");
  // The worker is served as a static asset from /public so it is never run
  // through the bundler/minifier (pdf.js v6 ships an ESM-only worker that
  // Terser cannot process). Kept in sync with the installed version by the
  // "postinstall" script in package.json. Local-only — no CDN.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data });
  try {
    let doc: Awaited<typeof loadingTask.promise>;
    try {
      doc = await loadingTask.promise;
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      if (name === "PasswordException") {
        throw new MaterialParseError(
          "This PDF is password-protected. Remove the password and try again, or paste the text instead."
        );
      }
      throw new MaterialParseError(
        "Could not open this PDF. It may be corrupt or not a valid PDF."
      );
    }

    const totalPages = doc.numPages;
    const pageCount = Math.min(totalPages, PDF_PAGE_LIMIT);
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      try {
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        pages.push(pageText);
      } finally {
        page.cleanup();
      }
    }

    const text = normalizeText(pages.join("\n\n"));

    if (!text) {
      throw new MaterialParseError(
        "No selectable text found in this PDF. Scanned or image-only PDFs aren't supported yet — paste the text instead."
      );
    }

    const warning =
      totalPages > PDF_PAGE_LIMIT
        ? `Only the first ${PDF_PAGE_LIMIT} of ${totalPages} pages were imported.`
        : undefined;

    return { text, warning };
  } finally {
    // Never let cleanup replace the user-facing parsing error.
    try {
      await loadingTask.destroy();
    } catch {
      // The document is already unusable; cleanup failure is not recoverable.
    }
  }
}

// ─── DOCX ────────────────────────────────────────────────────────────────────
async function extractDocx(file: File): Promise<{ text: string }> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();

  let value: string;
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    value = result.value ?? "";
  } catch {
    throw new MaterialParseError(
      "Could not read this DOCX. It may be corrupt or not a valid Word document."
    );
  }

  const text = normalizeText(value);
  if (!text) {
    throw new MaterialParseError(
      "This DOCX appears to be empty — no text was found."
    );
  }

  return { text };
}

// ─── Entry point ───────────────────────────────────────────────────────────
export async function parseMaterialFile(
  file: File
): Promise<ParsedMaterialFile> {
  const ext = getExtension(file.name);
  const fileType = file.type || CANONICAL_MIME[ext] || "";

  if (isTextExtension(ext)) {
    if (file.size > TEXT_MAX_BYTES) {
      throw new MaterialParseError(
        `This file is too large. Text files must be under ${formatBytes(
          TEXT_MAX_BYTES
        )}.`
      );
    }

    let raw: string;
    try {
      raw = await file.text();
    } catch {
      throw new MaterialParseError(
        "Could not read this file. Try a different file or paste the text."
      );
    }

    return finalize(normalizeText(raw), file.name, fileType);
  }

  if (ext === ".pdf" || ext === ".docx") {
    if (file.size > BINARY_MAX_BYTES) {
      throw new MaterialParseError(
        `This file is too large. PDF and DOCX files must be under ${formatBytes(
          BINARY_MAX_BYTES
        )}.`
      );
    }

    let extracted: { text: string; warning?: string };
    try {
      extracted =
        ext === ".pdf" ? await extractPdf(file) : await extractDocx(file);
    } catch (err) {
      if (err instanceof MaterialParseError) throw err;
      throw new MaterialParseError(
        "Could not extract text from this file. Try a different file or paste the text."
      );
    }

    return finalize(extracted.text, file.name, fileType, extracted.warning);
  }

  throw new MaterialParseError(
    "Unsupported file type. Supported formats: TXT, MD, CSV, JSON, HTML, PDF, DOCX."
  );
}

function finalize(
  text: string,
  fileName: string,
  fileType: string,
  baseWarning?: string
): ParsedMaterialFile {
  let content = text;
  let truncated = false;
  const warnings: string[] = [];
  if (baseWarning) warnings.push(baseWarning);

  if (content.length > EXTRACTED_TEXT_LIMIT) {
    content = content.slice(0, EXTRACTED_TEXT_LIMIT);
    truncated = true;
    warnings.push(
      `Extracted text was truncated to ${EXTRACTED_TEXT_LIMIT.toLocaleString()} characters.`
    );
  }

  return {
    content,
    fileName,
    fileType,
    truncated,
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  };
}
