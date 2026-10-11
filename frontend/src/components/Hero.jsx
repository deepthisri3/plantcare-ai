import React from 'react';
import { Camera, Compass, Sun, Footprints } from 'lucide-react';
import './Hero.css';

export default function Hero({ onStartUpload, onScrollToHowItWorks }) {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-tagline-badge">
            <Footprints size={15} className="tag-icon" />
            <span>Open-Weight AI Plant Observation</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-super">TOUCH GRASS</span>
            <span className="hero-main">Go outside. Find something growing.</span>
          </h1>

          <p className="hero-subheading">
            Snap a photo of a plant. Let open AI help you understand what you&apos;re seeing.
            Step away from the screen and reconnect with the wild world right at your doorstep.
          </p>

          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn-primary hero-btn-primary"
              onClick={onStartUpload}
            >
              <Camera size={18} />
              <span>Find a Plant</span>
            </button>

            <button 
              type="button" 
              className="btn-secondary hero-btn-secondary"
              onClick={onScrollToHowItWorks}
            >
              <Compass size={18} />
              <span>How It Works</span>
            </button>
          </div>

          <div className="hero-outdoor-note">
            <Sun size={16} className="sun-icon" />
            <span>&ldquo;The shortest screen time possible. The real adventure is outside.&rdquo;</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="organic-blob-backdrop" />
          <div className="hero-nature-card">
            <div className="nature-card-header">
              <span className="field-note-tag">Field Note #01</span>
              <span className="time-tag">Outdoors</span>
            </div>
            
            <div className="nature-card-illustration">
              <svg viewBox="0 0 200 160" className="leaf-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20 C140 40 170 90 150 140 C130 135 110 120 100 100 C90 120 70 135 50 140 C30 90 60 40 100 20 Z" fill="#2d5a42" opacity="0.9" />
                <path d="M100 20 L100 150" stroke="#85a087" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M100 60 Q125 50 140 70" stroke="#85a087" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M100 80 Q75 70 60 90" stroke="#85a087" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M100 105 Q125 95 135 115" stroke="#85a087" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="100" cy="18" r="4" fill="#e9c46a" />
              </svg>
            </div>

            <div className="nature-card-caption">
              <strong>Observation Protocol:</strong>
              <p>Look for light patterns, vein structures, and natural signs of life.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
