const fs = require("fs");
const pdfParseModule = require("pdf-parse");

async function extractText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // Defensive fallback: Check if the module itself is the function, 
    // or if the function is nested inside an internal property.
    const parsePDF = typeof pdfParseModule === "function" 
      ? pdfParseModule 
      : (pdfParseModule.default || pdfParseModule.pdfParse);

    if (typeof parsePDF !== "function") {
      throw new Error("Could not locate the parsing function inside the pdf-parse module.");
    }

    // Execute the resolved function cleanly
    const data = await parsePDF(buffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF extraction error:", err);
    return "";
  }
}

module.exports = extractText;