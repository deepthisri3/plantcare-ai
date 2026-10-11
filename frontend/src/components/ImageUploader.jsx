import { useState, useRef } from 'react';
import { UploadCloud, Camera, X, Sparkles, AlertCircle, FileImage } from 'lucide-react';
import './ImageUploader.css';
const MAX_SIZE_MB = 15;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// High quality plant samples for instant local testing
const SAMPLE_PLANTS = [
  {
    name: 'Outdoor Rose Foliage',
    desc: 'Rosa with early leaf spot observation',
    svgColor: '#2d6a4f',
    spotColor: '#8c502b',
  },
  {
    name: 'Wild Garden Mint',
    desc: 'Mentha spicata in partial shade',
    svgColor: '#386641',
    spotColor: null,
  },
  {
    name: 'Urban Tomato Leaf',
    desc: 'Solanum lycopersicum patio plant',
    svgColor: '#4f772d',
    spotColor: '#a73e28',
  },
];

export default function ImageUploader({ onAnalyze, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported format (${file.type || 'unknown'}). Please choose a JPG, PNG, or WEBP photo.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Photo is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or capture a plant photo first.');
      return;
    }
    onAnalyze(selectedFile);
  };

  // Generate an authentic JPEG leaf sample using HTML Canvas
  const loadSampleLeaf = (sample) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Outdoor background (soil/grass texture tone)
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 640);
    bgGrad.addColorStop(0, '#f2ece4');
    bgGrad.addColorStop(1, '#e5ded5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 640);

    // Stem
    ctx.beginPath();
    ctx.moveTo(320, 560);
    ctx.quadraticCurveTo(325, 340, 320, 100);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#4a6b4a';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(320, 100);
    ctx.bezierCurveTo(480, 200, 520, 420, 320, 500);
    ctx.bezierCurveTo(120, 420, 160, 200, 320, 100);
    ctx.fillStyle = sample.svgColor;
    ctx.fill();

    // Lateral veins
    ctx.strokeStyle = '#6ca176';
    ctx.lineWidth = 4;
    for (let y = 180; y <= 420; y += 45) {
      ctx.beginPath();
      ctx.moveTo(320, y);
      ctx.quadraticCurveTo(390, y - 20, 440, y + 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(320, y);
      ctx.quadraticCurveTo(250, y - 20, 200, y + 10);
      ctx.stroke();
    }

    // Spots if diseased
    if (sample.spotColor) {
      ctx.fillStyle = sample.spotColor;
      const spots = [
        [370, 240, 16],
        [260, 310, 14],
        [390, 330, 20],
        [240, 220, 12],
        [330, 420, 18],
      ];
      spots.forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a3014';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${sample.name.toLowerCase().replace(/\s+/g, '_')}.jpg`, {
          type: 'image/jpeg',
        });
        validateAndSetFile(file);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <section className="uploader-section" id="analyze">
      <div className="container-narrow">
        <div className="uploader-card natural-card">
          <div className="uploader-header">
            <span className="uploader-eyebrow">Outdoor Identification</span>
            <h2 className="uploader-title">What did you find?</h2>
            <p className="uploader-subtitle">
              Take a photo of a plant around you and let Gemma investigate.
            </p>
          </div>

          {errorMessage && (
            <div className="upload-error-alert" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!previewUrl ? (
            <div 
              className={`dropzone-area ${dragActive ? 'drag-over' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                className="file-input-hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                id="camera-upload"
                className="file-input-hidden"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
              />

              <div className="dropzone-content">
                <div className="upload-icon-circle">
                  <UploadCloud size={32} />
                </div>
                
                <h3 className="dropzone-prompt">Drag &amp; drop your plant photo</h3>
                <p className="dropzone-hint">
                  Supports JPG, PNG, WEBP up to {MAX_SIZE_MB}MB
                </p>

                <div className="upload-action-buttons">
                  <button
                    type="button"
                    className="btn-primary select-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage size={17} />
                    <span>Choose File</span>
                  </button>

                  <button
                    type="button"
                    className="btn-outline camera-btn"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera size={17} />
                    <span>Snap Photo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-container">
              <div className="preview-image-wrapper">
                <img src={previewUrl} alt="Plant preview" className="preview-image" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemove}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="preview-details">
                <div className="file-meta">
                  <strong className="file-name">{selectedFile?.name}</strong>
                  <span className="file-size">
                    {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                  </span>
                </div>

                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn-outline change-photo-btn"
                    onClick={handleRemove}
                    disabled={isAnalyzing}
                  >
                    Choose Different Photo
                  </button>

                  <button
                    type="button"
                    className="btn-primary analyze-submit-btn"
                    onClick={handleSubmit}
                    disabled={isAnalyzing}
                  >
                    <Sparkles size={18} />
                    <span>Analyze Plant</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sample quick-try selector */}
          <div className="sample-plants-picker">
            <span className="sample-title">Don&apos;t have a photo right now? Try a field sample:</span>
            <div className="sample-chips">
              {SAMPLE_PLANTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-chip"
                  onClick={() => loadSampleLeaf(sample)}
                  disabled={isAnalyzing}
                >
                  <span className="sample-dot" style={{ backgroundColor: sample.svgColor }} />
                  <span className="sample-name">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="upload-field-tip">
            <strong>Observation Tip:</strong> For highest accuracy, capture well-lit foliage showing natural leaf veins, flower petals, or symptoms against a clear outdoor background.
          </div>
        </div>
      </div>
    </section>
  );
}
