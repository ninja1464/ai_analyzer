import React from "react";

const SkillGapPage = () => {
  const currentSkills = ["React", "JavaScript", "Playwright"];
  const recommendedSkills = [
    { label: "Docker", level: "High" },
    { label: "AWS", level: "Medium" },
    { label: "System Design", level: "Low" },
  ];

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">Skill Gap</span>
          <h2>Identify the skills to fill your gap</h2>
        </div>
      </div>

      <div className="panel-grid">
        <section className="card list-card">
          <div className="card-title">Current Skills</div>
          <ul className="simple-list">
            {currentSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
        <section className="card list-card">
          <div className="card-title">Recommended Skills</div>
          <ul className="gap-list">
            {recommendedSkills.map((skill) => (
              <li key={skill.label}>
                <span>{skill.label}</span>
                <span className={`priority ${skill.level.toLowerCase()}`}>
                  {skill.level}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SkillGapPage;
