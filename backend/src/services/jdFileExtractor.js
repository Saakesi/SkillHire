import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const normalizeWhitespace = (text = "") =>
  String(text)
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const hasExt = (name = "", ext = "") => name.toLowerCase().endsWith(ext);

const extractTextWithPdfJs = async (buffer) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data, useWorkerFetch: false, isEvalSupported: false });
  const pdf = await loadingTask.promise;

  try {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (typeof item?.str === "string" ? item.str : ""))
        .filter(Boolean)
        .join(" ");

      if (pageText.trim()) {
        pages.push(pageText);
      }

      page.cleanup();
    }

    return normalizeWhitespace(pages.join("\n\n"));
  } finally {
    await pdf.destroy();
  }
};

export const extractTextFromJdFile = async (file) => {
  if (!file?.buffer || !file?.originalname) {
    return "";
  }

  const name = file.originalname.toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();

  if (mime === "application/pdf" || hasExt(name, ".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    let primaryError = null;

    try {
      const parsed = await parser.getText();
      const extracted = normalizeWhitespace(parsed?.text || "");
      if (extracted) return extracted;
    } catch (err) {
      primaryError = err;
    } finally {
      await parser.destroy();
    }

    try {
      const fallbackExtracted = await extractTextWithPdfJs(file.buffer);
      if (fallbackExtracted) return fallbackExtracted;
    } catch (fallbackErr) {
      const primaryMessage = primaryError?.message ? `Primary parser failed: ${primaryError.message}` : "Primary parser failed.";
      const fallbackMessage = fallbackErr?.message ? `Fallback parser failed: ${fallbackErr.message}` : "Fallback parser failed.";
      throw new Error(`Unable to parse PDF text. ${primaryMessage} ${fallbackMessage}`);
    }

    if (primaryError) {
      throw new Error(`Unable to parse PDF text. Primary parser failed: ${primaryError.message || "unknown error"}`);
    }

    throw new Error("Unable to parse PDF text. No extractable text found.");
  }

  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    hasExt(name, ".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeWhitespace(parsed?.value || "");
  }

  if (mime.startsWith("text/") || hasExt(name, ".txt") || hasExt(name, ".md")) {
    return normalizeWhitespace(file.buffer.toString("utf8"));
  }

  throw new Error("Unsupported file type. Upload PDF, DOCX, TXT, or MD.");
};
