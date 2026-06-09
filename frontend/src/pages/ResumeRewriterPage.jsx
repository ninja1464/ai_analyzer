import React, { useState } from "react";

const ResumeRewriterPage = () => {
  const original = "Worked on frontend.";
  const suggestions = [
    "Developed responsive React applications used by 50,000+ users.",
    "Delivered accessible frontend features for web and mobile product launches.",
  ];
  const [currentSuggestion, setCurrentSuggestion] = useState(suggestions[0]);

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Resume Rewriter</span>
          <h2>Improve your bullet points instantly</h2>
        </div>
      </div>

      <section className="card rewrite-card">
        <div className="card-title">Original</div>
        <div className="text-box">{original}</div>
        <div className="card-title">AI Suggestion</div>
        <div className="text-box suggestion">{currentSuggestion}</div>
        <div className="button-row">
          <button type="button" className="secondary-button">
            Accept
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setCurrentSuggestion((prev) =>
                prev === suggestions[0] ? suggestions[1] : suggestions[0],
              )
            }
          >
            Regenerate
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResumeRewriterPage;
