import React, { useState } from "react";
import { Upload } from "lucide-react";

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
        <Upload size={28} style={{ color: "var(--accent)", opacity: 0.7 }} />
        <div>
          <strong>{file ? file.name : "Click or drag to upload"}</strong>
          <span>PDF, DOC, or DOCX — max 5 MB</span>
        </div>
      </label>
      <button
        type="button"
        className="primary-button"
        disabled={loading || !file}
        onClick={() => onAnalyze(file)}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
};

export default UploadResume;
