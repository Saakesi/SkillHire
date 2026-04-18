import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const normalizeWhitespace = (text = "") =>
  String(text)
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const hasExt = (name = "", ext = "") => name.toLowerCase().endsWith(ext);

export const extractTextFromJdFile = async (file) => {
  if (!file?.buffer || !file?.originalname) {
    return "";
  }

  const name = file.originalname.toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();

  if (mime === "application/pdf" || hasExt(name, ".pdf")) {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const parsed = await parser.getText();
      return normalizeWhitespace(parsed?.text || "");
    } finally {
      await parser.destroy();
    }
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
