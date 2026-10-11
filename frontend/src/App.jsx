import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GoOutsideChecklist from './components/GoOutsideChecklist';
import HowItWorks from './components/HowItWorks';
import ImageUploader from './components/ImageUploader';
import AnalysisLoader from './components/AnalysisLoader';
import PlantResult from './components/PlantResult';
import OutdoorChallenge from './components/OutdoorChallenge';
import OpenAISummary from './components/OpenAISummary';
import OllamaTroubleshooting from './components/OllamaTroubleshooting';
import Footer from './components/Footer';
import { fetchModelStatus, analyzePlantImage } from './services/api';
import { AlertCircle, Terminal, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [modelStatus, setModelStatus] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [showOllamaModal, setShowOllamaModal] = useState(false);

  const loadStatus = async () => {
    const status = await fetchModelStatus();
    setModelStatus(status);
  };

  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      const status = await fetchModelStatus();
      if (!cancelled) {
        setModelStatus(status);
      }
    };

    checkStatus();
    // Periodic check every 15 seconds to detect when user runs `ollama serve`
    const timer = setInterval(checkStatus, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleStartUpload = () => {
    const elem = document.getElementById('analyze');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHowItWorks = () => {
    const elem = document.getElementById('how-it-works');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const previewUrl = URL.createObjectURL(file);
    setCurrentPreviewUrl(previewUrl);

    try {
      const response = await analyzePlantImage(file);
      if (response && response.success && response.analysis) {
        setAnalysisResult(response);
        setTimeout(() => {
          const resElem = document.getElementById('results');
          if (resElem) resElem.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setAnalysisError({
          message: response?.error || 'Gemma could not analyze that image right now.',
          errorCode: response?.error_code || 'ANALYSIS_FAILED',
          troubleshooting: response?.troubleshooting || [
            'Make sure Ollama is running (`ollama serve`) and model is pulled.',
            'Confirm the uploaded file is a clear outdoor plant photo.',
          ],
        });
      }
    } catch (err) {
      console.error('Plant analysis error:', err);
      setAnalysisError({
        message: 'A connection error occurred while communicating with Gemma.',
        errorCode: 'NETWORK_ERROR',
        troubleshooting: [
          'Verify the FastAPI server is running on http://localhost:8000',
          'Verify Ollama is reachable on http://localhost:11434',
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      setCurrentPreviewUrl(null);
    }
    handleStartUpload();
  };

  const handleTakeMeOutside = () => {
    const challengeElem = document.getElementById('challenge');
    if (challengeElem) {
      challengeElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="touch-grass-app">
      <Navbar
        modelStatus={modelStatus}
        onOpenOllamaHelp={() => setShowOllamaModal(true)}
        onNavigate={handleNavigate}
      />

      <main>
        <Hero
          onStartUpload={handleStartUpload}
          onScrollToHowItWorks={handleScrollToHowItWorks}
        />

        <GoOutsideChecklist onStartExploring={handleStartUpload} />

        <HowItWorks />

        {/* Upload & Analysis section */}
        <div id="analyze-section-wrapper">
          <ImageUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {isAnalyzing && (
            <AnalysisLoader modelName={modelStatus?.configured_model || 'gemma3:4b'} />
          )}

          {analysisError && !isAnalyzing && (
            <div className="container-narrow animate-fade-in">
              <div className="analysis-error-card natural-card" role="alert">
                <div className="error-header">
                  <div className="error-icon-box">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="error-card-title">Observation Could Not Complete</h3>
                    <p className="error-card-code">Code: {analysisError.errorCode}</p>
                  </div>
                </div>

                <p className="error-explanation">{analysisError.message}</p>

                {analysisError.troubleshooting && analysisError.troubleshooting.length > 0 && (
                  <div className="troubleshooting-steps">
                    <strong>Suggested resolution:</strong>
                    <ul>
                      {analysisError.troubleshooting.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="error-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowOllamaModal(true)}
                  >
                    <Terminal size={15} />
                    <span>View Setup Guide</span>
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setAnalysisError(null)}
                  >
                    <RefreshCw size={15} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <PlantResult
              result={analysisResult}
              previewUrl={currentPreviewUrl}
              onReset={handleReset}
              onTakeMeOutside={handleTakeMeOutside}
            />
          )}
        </div>

        <OutdoorChallenge />

        <OpenAISummary />
      </main>

      <Footer onOpenOllamaHelp={() => setShowOllamaModal(true)} />

      {showOllamaModal && (
        <OllamaTroubleshooting
          modelStatus={modelStatus}
          onClose={() => setShowOllamaModal(false)}
          onRefresh={loadStatus}
        />
      )}
    </div>
  );
}
