import React from 'react';
import { Footprints, Camera, Cpu, Compass } from 'lucide-react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Footprints,
      title: 'Walk Outdoors',
      description: 'Find a plant in your backyard, local park, balcony garden, or along a sidewalk crack.',
    },
    {
      num: '02',
      icon: Camera,
      title: 'Take a Photo',
      description: 'Capture a close, crisp photo in daylight. Focus on leaf patterns, discoloration, or blooms.',
    },
    {
      num: '03',
      icon: Cpu,
      title: 'Gemma 3 Inspects',
      description: 'An open-weight Gemma model evaluates the image locally via Ollama without proprietary cloud lock-in.',
    },
    {
      num: '04',
      icon: Compass,
      title: 'Return to Nature',
      description: 'Review your field notes, understand your plant friend, then close your screen and enjoy your walk.',
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">The Experience</span>
          <h2 className="section-heading">How Touch Grass Works</h2>
          <p className="section-subheading">
            Technology that exists to guide you into the living environment, not trap you in a digital feed.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="step-card natural-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon-wrap">
                  <Icon size={24} />
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
