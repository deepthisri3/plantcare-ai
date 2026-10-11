import React, { useState, useEffect } from 'react';
import { Compass, Shuffle, Sun } from 'lucide-react';
import { fetchChallenge } from '../services/api';
import './OutdoorChallenge.css';

export default function OutdoorChallenge() {
  const [challenge, setChallenge] = useState({
    title: 'The Hidden Neighbor',
    mission: 'Find a plant you pass by every day but have never actually stopped to notice.',
    outdoor_tip: 'Look closely at the leaf edges, bark texture, or how it faces the sunlight.',
    difficulty: 'Easy',
    category: 'Mindfulness',
  });
  const [loading, setLoading] = useState(false);

  const loadNewChallenge = async () => {
    setLoading(true);
    try {
      const data = await fetchChallenge();
      if (data && data.title) {
        setChallenge(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchChallenge().then((data) => {
      if (!cancelled && data && data.title) {
        setChallenge(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="outdoor-challenge-section" id="challenge">
      <div className="container-narrow">
        <div className="challenge-card natural-card">
          <div className="challenge-header">
            <div className="challenge-badge">
              <Compass size={16} />
              <span>Touch Grass Challenge</span>
            </div>
            <div className="challenge-meta-pills">
              <span className="challenge-category">{challenge.category}</span>
              <span className="challenge-difficulty">{challenge.difficulty}</span>
            </div>
          </div>

          <div className="challenge-body">
            <span className="challenge-prefix">Your Outdoor Mission:</span>
            <h3 className="challenge-title">&ldquo;{challenge.title}&rdquo;</h3>
            <p className="challenge-mission">{challenge.mission}</p>

            <div className="challenge-tip-box">
              <Sun size={17} className="tip-icon" />
              <div className="tip-content">
                <strong>Mindful Tip:</strong>
                <span>{challenge.outdoor_tip}</span>
              </div>
            </div>
          </div>

          <div className="challenge-footer">
            <div className="challenge-subtext">
              <span>No streaks, no accounts, no dopamine loops. Just fresh air.</span>
            </div>

            <button
              type="button"
              className="btn-outline draw-challenge-btn"
              onClick={loadNewChallenge}
              disabled={loading}
            >
              <Shuffle size={16} className={loading ? 'spinning' : ''} />
              <span>{loading ? 'Drawing Mission...' : 'Draw Another Mission'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
