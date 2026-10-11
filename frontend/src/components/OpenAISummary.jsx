import React from 'react';
import { Lock, Cpu, Sliders, ShieldCheck } from 'lucide-react';
import './OpenAISummary.css';

export default function OpenAISummary() {
  const pillars = [
    {
      icon: Lock,
      title: 'Private & Local Inference',
      desc: 'Plant photos stay on your machine. You never transmit private outdoor moments or GPS data to closed commercial cloud silos.',
    },
    {
      icon: Cpu,
      title: 'Gemma Open Weights',
      desc: 'Built on Google DeepMind\'s open-weight Gemma architecture, inspected, benchmarked, and audited by researchers worldwide.',
    },
    {
      icon: Sliders,
      title: 'Swap Models Instantly',
      desc: 'Switch between gemma3:4b, gemma3:12b, or other open vision weights with a single environment variable (GEMMA_MODEL).',
    },
    {
      icon: ShieldCheck,
      title: 'Zero API Paywalls',
      desc: 'Run completely free of API rate limits, closed token billing, or vendor deprecation.',
    },
  ];

  return (
    <section className="open-ai-section" id="open-ai">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Hacktoberfest 2026 Challenge</span>
          <h2 className="section-heading">Why Open-Weight AI Matters</h2>
          <p className="section-subheading">
            Technology designed to serve human curiosity and the natural world, built entirely on verifiable open weights.
          </p>
        </div>

        <div className="pillars-grid">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="pillar-card natural-card">
                <div className="pillar-icon-box">
                  <Icon size={22} />
                </div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
