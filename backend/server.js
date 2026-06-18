require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const extractText = require("./utils/ocr");
const analyzeText = require("./utils/analyze");
const { verifySkillsAI } = require("./utils/verifySkillsAI");

const app = express();
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post(
  "/upload",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  async (req, res) => {
    const filesToCleanup = [];
    if (req.files?.resume) filesToCleanup.push(req.files.resume[0].path);
    if (req.files?.certificates) {
      req.files.certificates.forEach(file => filesToCleanup.push(file.path));
    }

    try {
      if (!req.files || !req.files.resume) {
        return res.status(400).json({ error: "Resume required" });
      }

      const resumePath = req.files.resume[0].path;
      const resumeText = await extractText(resumePath);
      const resumeAnalysis = analyzeText(resumeText);

      const certPromises = (req.files.certificates || []).map(async (file) => {
        const text = await extractText(file.path);
        return {
          name: file.originalname,
          text,
          analysis: analyzeText(text),
        };
      });
      const certResults = await Promise.all(certPromises);

      const certTexts = certResults.map((c) => c.text);
      const skillReport = await verifySkillsAI(resumeText, certTexts);

      res.json({
        status: resumeAnalysis.status,
        resumeText,
        resumeAnalysis,
        certificates: certResults,
        skillReport,
      });
    } catch (err) {
      console.error("Processing failed:", err);
      res.status(500).json({ error: "Processing failed during AI compilation." });
    } finally {
      // Storage cleanup loops
      for (const filePath of filesToCleanup) {
        fs.promises.unlink(filePath).catch(err => console.error(`Cleanup failed: ${filePath}`, err));
      }
    }
  }
);

app.listen(3000, () => console.log("Server running on port 3000 🚀"));