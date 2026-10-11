import React, { useState, useEffect } from 'react';
import { Eye, Search, Sprout, ClipboardList } from 'lucide-react';
import './AnalysisLoader.css';

const STAGES = [
  { text: 'Examining the leaves...', icon: Eye },
  { text: 'Looking for visible symptoms...', icon: Search },
  { text: 'Identifying the plant...', icon: Sprout },
  { text: 'Preparing your field notes...', icon: ClipboardList },
];

export default function AnalysisLoader({ modelName = 'gemma3:4b' }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STAGES[currentStageIdx].icon;

  return (
    <div className="analysis-loader-container natural-card animate-fade-in" role="status" aria-live="polite">
      <div className="loader-inner">
        <div className="loader-halo-wrapper">
          <div className="loader-halo-pulse" />
          <div className="loader-icon-center">
            <CurrentIcon size={34} className="loader-active-icon" />
          </div>
        </div>

        <h3 className="loader-title">Gemma is looking closely...</h3>
        <p className="loader-stage-text">{STAGES[currentStageIdx].text}</p>

        <div className="stage-indicators">
          {STAGES.map((s, idx) => (
            <div
              key={idx}
              className={`stage-step-pill ${
                idx === currentStageIdx ? 'active' : idx < currentStageIdx ? 'completed' : 'pending'
              }`}
            >
              <span className="stage-step-dot" />
              <span className="stage-step-name">{s.text.replace('...', '')}</span>
            </div>
          ))}
        </div>

        <div className="loader-subtext">
          <span>Powered by open-weight <strong>{modelName}</strong></span>
          <span className="dot-sep">•</span>
          <span>Inference running locally on your hardware</span>
        </div>
      </div>
    </div>
  );
}
