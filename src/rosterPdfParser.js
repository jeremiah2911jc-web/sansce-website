import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { RosterPdfParserError, parseLandRegisterTextPages } from "./rosterPdfTextParser.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

async function extractTextPagesFromPdf(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapPacked: true,
    disableFontFace: true,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({ normalizeWhitespace: true });
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join("\n");

    pages.push({
      pageNumber,
      text,
      textItemCount: textContent.items.length,
    });
  }

  return pages;
}

export async function parseReadableLandRegisterPdfs(files) {
  const pdfFiles = Array.from(files ?? []);
  if (!pdfFiles.length) {
    throw new RosterPdfParserError("NO_FILES", "請先選擇可讀電子謄本 PDF。");
  }

  const importedAt = new Date().toLocaleString("zh-TW", { hour12: false });
  const parsedSources = [];

  for (const file of pdfFiles) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new RosterPdfParserError("UNSUPPORTED_FILE", "PDF 入口只接受 .pdf 檔案。");
    }

    const pages = await extractTextPagesFromPdf(file);
    parsedSources.push(parseLandRegisterTextPages(pages, file.name, importedAt));
  }

  return {
    importedAt,
    sourceType: "readable-pdf",
    sourceFiles: pdfFiles.map((file) => file.name),
    sources: parsedSources.map((source) => ({
      sourceFilename: source.sourceFilename,
      pageCount: source.pageCount,
      textCharCount: source.textCharCount,
      parcelCount: source.parcels.length,
      landRightCount: source.landRights.length,
    })),
    parcels: parsedSources.flatMap((source) => source.parcels),
    landRights: parsedSources.flatMap((source) => source.landRights),
    buildingRights: parsedSources.flatMap((source) => source.buildingRights),
    mortgages: parsedSources.flatMap((source) => source.mortgages),
    issues: parsedSources.flatMap((source) => source.issues),
  };
}

export { RosterPdfParserError };
