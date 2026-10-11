import { Sprout, Cpu, Sparkles } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ modelStatus, onOpenOllamaHelp, onNavigate }) {
  const isReady = modelStatus?.ollama_connected && modelStatus?.model_available;
  const isConnectedNoModel = modelStatus?.ollama_connected && !modelStatus?.model_available;

  return (
    <header className="navbar-header">
      <div className="container navbar-inner">
        <a 
          href="#home" 
          className="brand-logo"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        >
          <div className="brand-icon-wrap">
            <Sprout className="brand-icon" size={24} />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title">Touch Grass</span>
            <span className="brand-subtitle">AI Plant Companion</span>
          </div>
        </a>

        <div className="nav-actions">
          <div className="hacktoberfest-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Hacktoberfest 2026</span>
          </div>

          <button 
            type="button" 
            className={`model-status-pill ${isReady ? 'status-ready' : isConnectedNoModel ? 'status-pull' : 'status-offline'}`}
            onClick={onOpenOllamaHelp}
            title="Click for Gemma / Ollama setup details"
          >
            <Cpu size={15} />
            <span className="model-name-label">
              {modelStatus?.configured_model || 'gemma3:4b'}
            </span>
            <span className="status-indicator">
              {isReady ? (
                <span className="status-dot ready" />
              ) : (
                <span className="status-dot warning" />
              )}
            </span>
            <span className="status-text">
              {isReady ? 'Ready' : isConnectedNoModel ? 'Pull Model' : 'Setup Ollama'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
