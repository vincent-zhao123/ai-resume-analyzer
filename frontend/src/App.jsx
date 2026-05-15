import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "http://localhost:3001/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Error analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero">
        <p className="badge">AWS Bedrock Powered</p>
        <h1>AI Resume Analyzer</h1>
        <p>
          Upload your resume, paste a job description, and get an AI-powered
          match score, skill gap analysis, ATS keywords, and interview prep.
        </p>
      </div>

      <div className="layout">
        <div className="card input-card">
          <h2>Analyze Your Resume</h2>

          <label>Resume PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />

          {resumeFile && (
            <p className="file-name">Selected: {resumeFile.name}</p>
          )}

          <label>Job Description</label>
          <textarea
            rows="12"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {loading && (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Analyzing resume with Amazon Bedrock...</p>
            </div>
          )}
        </div>

        <div className="card info-card">
          <h2>Cloud AI Pipeline</h2>
          <ul>
            <li>React frontend collects resume and job description</li>
            <li>Express backend receives multipart upload</li>
            <li>PDF text is extracted from the resume</li>
            <li>Amazon Bedrock Nova generates structured analysis</li>
            <li>Frontend renders match score and recommendations</li>
          </ul>
        </div>
      </div>

      {result && (
        <div className="results">
          <div className="score-card">
            <div>
              <p className="small-label">Resume Match Score</p>
              <h2>{result.matchScore}%</h2>
            </div>
            <p>{result.summary}</p>
          </div>

          <ResultSection title="Strengths" items={result.strengths} />
          <ResultSection title="Skill Gaps" items={result.skillGaps} />
          <ResultSection title="ATS Keywords" items={result.atsKeywords} />
          <ResultSection
            title="Rewritten Resume Bullets"
            items={result.rewrittenBullets}
          />
          <ResultSection
            title="Interview Questions"
            items={result.interviewQuestions}
          />

          <div className="card">
            <h2>AWS Cloud Explanation</h2>

            <h3>AWS Services Used</h3>
            <TagList items={result.cloudExplanation.awsServicesUsed} />

            <h3>AI Techniques Used</h3>
            <TagList items={result.cloudExplanation.aiTechniquesUsed} />

            <h3>Data Flow</h3>
            <ol>
              {result.cloudExplanation.dataFlow.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
      <div className="results">
        <div className="card">
          <h2>Analysis History</h2>

          <button onClick={fetchHistory}>Refresh History</button>

          {history.length === 0 ? (
            <p>No history loaded yet.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-item" key={item.analysisId}>
                  <h3>{item.resumeFileName}</h3>
                  <p>Match Score: {item.matchScore}%</p>
                  <p>{item.summary}</p>
                  <p className="small-label">
                    Created At: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultSection({ title, items }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <ul>
        {items?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TagList({ items }) {
  return (
    <div className="tag-list">
      {items?.map((item, index) => (
        <span className="tag" key={index}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default App;