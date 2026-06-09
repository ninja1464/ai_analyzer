import React, { useState } from "react";

const questions = {
  Technical: [
    {
      question: "Explain React Virtual DOM.",
      answer:
        "React Virtual DOM is a lightweight abstraction of the real DOM that allows React to update only the components that have changed.",
    },
  ],
  Behavioral: [
    {
      question: "Tell me about a time you solved a problem.",
      answer:
        "I approached the challenge by analyzing data, collaborating with the team, and iterating quickly to deliver a strong result.",
    },
  ],
  "System Design": [
    {
      question: "How would you design a scalable job board system?",
      answer:
        "I would use modular services for search, storage, and notifications, with caching layers to support high traffic.",
    },
  ],
};

const InterviewQuestionsPage = () => {
  const [activeTab, setActiveTab] = useState("Technical");

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Interview Questions</span>
          <h2>Practice questions for every category</h2>
        </div>
      </div>

      <section className="card tab-card">
        <div className="tab-row">
          {Object.keys(questions).map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {questions[activeTab].map((item) => (
          <div key={item.question} className="qa-block">
            <div className="qa-question">Q: {item.question}</div>
            <details>
              <summary>Show Answer</summary>
              <p>{item.answer}</p>
            </details>
          </div>
        ))}
      </section>
    </div>
  );
};

export default InterviewQuestionsPage;
