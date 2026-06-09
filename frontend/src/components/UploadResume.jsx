import React, { useState } from "react";

const UploadResume = ({ onAnalyze, loading }) => {
  const [file, setFile] = useState(null);

  return (
    <div className="upload-panel">
      <label className="upload-dropzone">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div>
          <strong>{file ? file.name : "Drag & Drop PDF/DOCX"}</strong>
          <span>Click or drop your resume here to upload.</span>
        </div>
      </label>
      <button
        type="button"
        className="primary-button"
        disabled={loading}
        onClick={() => {
          if (!file) {
            window.alert("Please choose a resume file before analyzing.");
            return;
          }
          onAnalyze(file);
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
      <p className="upload-note">Accepted formats: PDF, DOC, DOCX.</p>
    </div>
  );
};

export default UploadResume;
