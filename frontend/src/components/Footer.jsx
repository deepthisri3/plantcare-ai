import { Sprout, BookOpen, Award } from 'lucide-react';
import './Footer.css';

function GithubIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Footer({ onOpenOllamaHelp }) {
  return (
    <footer className="touch-grass-footer">
      <div className="container footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <div className="footer-icon-wrap">
              <Sprout size={20} />
            </div>
            <span className="footer-brand-title">Touch Grass</span>
          </div>
          <p className="footer-mission-line">Built with open-weight AI.</p>
          <p className="footer-mission-sub">Designed to get people outside.</p>
          <div className="footer-disclaimer-short">
            Hacktoberfest 2026 Open-Source AI Challenge — Week 1
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-links-title">Resources</h4>
          <ul className="footer-links-list">
            <li>
              <a 
                href="https://github.com/deepthisri3/plantcare-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-nav-link"
              >
                <GithubIcon size={15} />
                <span>GitHub Repository</span>
              </a>
            </li>
            <li>
              <a 
                href="#how-it-works" 
                className="footer-nav-link"
              >
                <BookOpen size={15} />
                <span>Architecture &amp; Docs</span>
              </a>
            </li>
            <li>
              <button 
                type="button" 
                className="footer-text-btn"
                onClick={onOpenOllamaHelp}
              >
                <Award size={15} />
                <span>Gemma Model Setup</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-links-title">Hacktoberfest 2026</h4>
          <p className="footer-challenge-text">
            &ldquo;Build something with open-weight models or open-source AI that gets people off the screen and into the world.&rdquo;
          </p>
          <span className="footer-challenge-tag">Week 1: Touch Grass</span>
        </div>
      </div>

      <div className="container footer-bottom-bar">
        <p className="footer-copy">
          Touch Grass — An open-source plant observation initiative.
        </p>
        <p className="footer-credit">
          Powered by Gemma 3 &amp; Ollama
        </p>
      </div>
    </footer>
  );
}
