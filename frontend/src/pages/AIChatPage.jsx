import React, { useState } from "react";

const AIChatPage = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(
    "Based on your resume, AWS and Docker would increase your market value.",
  );

  const handleAsk = () => {
    setResponse(
      prompt
        ? `Based on your resume, ${prompt.trim().endsWith("?") ? prompt.trim().replace(/\?$/, "") : prompt.trim()}.`
        : response,
    );
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">AI Chat</span>
          <h2>Ask about your resume</h2>
        </div>
      </div>

      <section className="card chat-card">
        <p className="card-copy">
          Like ChatGPT, but restricted to the uploaded resume and role context.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about your resume..."
        />
        <button type="button" className="primary-button" onClick={handleAsk}>
          Send Question
        </button>

        <div className="chat-response">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      </section>
    </div>
  );
};

export default AIChatPage;
