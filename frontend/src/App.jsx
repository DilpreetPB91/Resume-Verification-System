import { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Not Uploaded");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!resume) {
      alert("Upload resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    certificates.forEach((c) => formData.append("certificates", c));

    setLoading(true);
    setResult(null);
    setStatus("Running File Layout Extractions...");

    try {
      const res = await fetch("https://resume-verification-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
      setStatus("Server Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>AI Resume Verification</h1>
        <p>Verify claimed resume skills against official certification uploads seamlessly.</p>
      </header>

      <div className="main-layout">
        <div className="panel upload-panel">
          <div className="card">
            <h3>Upload Resume</h3>
            <input type="file" accept="application/pdf" onChange={(e) => setResume(e.target.files[0])} />
          </div>

          <div className="card">
            <h3>Upload Certificates</h3>
            <input type="file" multiple accept="application/pdf" onChange={(e) => setCertificates(Array.from(e.target.files))} />
          </div>

          <button className={`btn ${loading ? "disabled" : ""}`} onClick={handleSubmit} disabled={loading}>
            {loading ? "Analyzing..." : "Submit for Verification"}
          </button>

          <div className="status-banner">
            Status: <span className={status.includes("Verified") ? "verified" : status.includes("❌") || status.includes("Fake") ? "error" : "pending"}>{status}</span>
          </div>
        </div>

        <div className="panel results-panel">
          {result ? (
            <div className="preview fade-in">
              <h3>🧠 Skill Report</h3>
              <p><strong>Score:</strong> {result.skillReport.score}%</p>
              <p><strong>Confidence:</strong> {result.skillReport.confidence}</p>
              <hr />
              <h4>✅ Verified Skills</h4>
              <ul>
                {result.skillReport.verifiedSkills.map((s, i) => <li key={i}>{s}</li>)}
                {result.skillReport.verifiedSkills.length === 0 && <li>None Detected</li>}
              </ul>
              <h4>❌ Unverified Skills</h4>
              <ul>
                {result.skillReport.unverifiedSkills.map((s, i) => <li key={i}>{s}</li>)}
                {result.skillReport.unverifiedSkills.length === 0 && <li>None Detected</li>}
              </ul>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Analysis Compiled</h3>
              <p>Upload files and trigger the auditor to display verification outputs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;