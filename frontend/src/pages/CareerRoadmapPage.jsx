import React from "react";

const CareerRoadmapPage = () => {
  const roadmap = [
    { month: "Month 1", items: ["Advanced JavaScript"] },
    { month: "Month 2", items: ["TypeScript"] },
    { month: "Month 3", items: ["React Architecture"] },
    { month: "Month 4", items: ["System Design"] },
  ];

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Career Roadmap</span>
          <h2>Plan your path to Frontend Developer</h2>
        </div>
      </div>

      <section className="card roadmap-card">
        <div className="card-title">Goal: Frontend Developer</div>
        <div className="roadmap-list">
          {roadmap.map((entry) => (
            <div key={entry.month} className="roadmap-item">
              <strong>{entry.month}</strong>
              <ul>
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CareerRoadmapPage;
