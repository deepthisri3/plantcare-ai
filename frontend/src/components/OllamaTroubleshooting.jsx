import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, RefreshCw, Cpu } from 'lucide-react';
import './OllamaTroubleshooting.css';

export default function OllamaTroubleshooting({ modelStatus, onClose, onRefresh }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const model = modelStatus?.configured_model || 'gemma3:4b';
  const baseUrl = modelStatus?.base_url || 'http://localhost:11434';

  const commands = [
    { label: '1. Install Ollama (if needed)', cmd: 'Download from https://ollama.com/download' },
    { label: '2. Start Ollama service', cmd: 'ollama serve' },
    { label: '3. Download Gemma open model', cmd: `ollama pull ${model}` },
    { label: '4. Start FastAPI backend', cmd: 'python -m uvicorn app.main:app --reload --port 8000' },
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="troubleshoot-modal natural-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close setup modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-wrap">
            <Cpu size={24} />
          </div>
          <div>
            <h3 id="modal-title" className="modal-title">Open-Weight Gemma AI Setup</h3>
            <p className="modal-subtitle">Local inference guide powered by Ollama</p>
          </div>
        </div>

        <div className="status-summary-box">
          <div className="status-row">
            <span className="status-label">Ollama Service:</span>
            <span className={`status-badge ${modelStatus?.ollama_connected ? 'badge-ok' : 'badge-err'}`}>
              {modelStatus?.ollama_connected ? `Connected (${baseUrl})` : `Offline (${baseUrl})`}
            </span>
          </div>

          <div className="status-row">
            <span className="status-label">Configured Model:</span>
            <span className="status-val-code">{model}</span>
          </div>

          <div className="status-row">
            <span className="status-label">Model Available:</span>
            <span className={`status-badge ${modelStatus?.model_available ? 'badge-ok' : 'badge-warn'}`}>
              {modelStatus?.model_available ? 'Ready for Vision' : 'Not yet downloaded in Ollama'}
            </span>
          </div>

          {modelStatus?.available_models && modelStatus.available_models.length > 0 && (
            <div className="status-row">
              <span className="status-label">Installed Models:</span>
              <span className="status-val">{modelStatus.available_models.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="setup-steps-container">
          <h4 className="steps-header">Quick Terminal Commands</h4>
          <div className="commands-list">
            {commands.map((c, idx) => (
              <div key={idx} className="command-block">
                <span className="command-label">{c.label}</span>
                <div className="command-code-row">
                  <code>{c.cmd}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopy(c.cmd, idx)}
                    title="Copy command"
                  >
                    {copiedIndex === idx ? <Check size={15} className="copied-icon" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline modal-docs-link"
          >
            <span>Ollama Website</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            className="btn-primary modal-refresh-btn"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spinning' : ''} />
            <span>Check Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
