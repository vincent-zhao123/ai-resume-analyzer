const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { analyzeResumeWithBedrock,} = require("./services/bedrock");
const { uploadResumeToS3 } = require("./services/s3");
const { v4: uuidv4 } = require("uuid");
const {saveAnalysisToDynamoDB, getAnalysisHistory,} = require("./services/dynamodb");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Analyzer backend is running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ai-resume-analyzer-backend",
  });
});

app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    const resumeFile = req.file;
    const jobDescription = req.body.jobDescription;

    if (!resumeFile || !jobDescription) {
      return res.status(400).json({
        error: "Resume file and job description are required.",
      });
    }

    const pdfData = await pdfParse(resumeFile.buffer);
    const resumeText = pdfData.text;

    console.log("Extracted resume text length:", resumeText.length);
    console.log("Resume preview:", resumeText.slice(0, 500));
    const s3Result = await uploadResumeToS3(resumeFile);
    console.log("Uploaded to S3:", s3Result);

    const analysisResult =
    await analyzeResumeWithBedrock(
        resumeText,
        jobDescription
    );
    const analysisId = uuidv4();

    await saveAnalysisToDynamoDB({
    analysisId,
    resumeFileName: resumeFile.originalname,
    s3Bucket: s3Result.bucket,
    s3Key: s3Result.key,
    jobDescription,
    analysisResult,
    });

    analysisResult.analysisId = analysisId;

    res.json(analysisResult);

    res.json(mockResult);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Failed to analyze resume.",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.get("/api/history", async (req, res) => {
  try {
    const history = await getAnalysisHistory();
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});