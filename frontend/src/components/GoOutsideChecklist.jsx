import React from 'react';
import { Check, ArrowRight, TreePine } from 'lucide-react';
import './GoOutsideChecklist.css';

export default function GoOutsideChecklist({ onStartExploring }) {
  const checklistItems = [
    { label: 'Find a plant', sub: 'Along a footpath, in your backyard, or in a park' },
    { label: 'Take a photo', sub: 'Capture a close, well-lit shot of leaves or blooms' },
    { label: 'Upload it', sub: 'Let open-weight Gemma analyze what you observed' },
    { label: 'Discover what you found', sub: 'Learn its species, health status, and care notes' },
  ];

  return (
    <section className="outside-checklist-section">
      <div className="container-narrow">
        <div className="outside-banner-card natural-card">
          <div className="outside-header">
            <div className="outside-badge">
              <TreePine size={16} />
              <span>Real World First</span>
            </div>
            <h2 className="outside-title">Step outside.</h2>
            <p className="outside-subtitle">
              The goal of Touch Grass is to minimize screen time and maximize your real-world time under the open sky.
            </p>
          </div>

          <div className="checklist-grid">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="checklist-item">
                <div className="check-bullet">
                  <Check size={18} strokeWidth={3} />
                </div>
                <div className="check-text">
                  <span className="check-label">{item.label}</span>
                  <span className="check-sub">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="outside-footer">
            <div className="outside-message-callout">
              <span className="message-line-1">Your next step isn&apos;t on the screen.</span>
              <strong className="message-line-2">It&apos;s outside.</strong>
            </div>

            <button 
              type="button" 
              className="btn-primary start-exploring-btn"
              onClick={onStartExploring}
            >
              <span>START EXPLORING</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
