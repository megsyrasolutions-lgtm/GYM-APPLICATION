import React, { useState, useEffect, useRef } from 'react';
import bodylifeLogo from '../assets/bodylife_logo.png';
import { 
  Dumbbell, 
  Database, 
  ShieldCheck, 
  Wifi, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Volume2, 
  VolumeX, 
  FastForward,
  Activity
} from 'lucide-react';
import { playStartupChime } from '../utils/audio';
import '../styles/loadingScreen.css';

const MOTIVATIONAL_QUOTES = [
  "“Discipline is the bridge between goals and accomplishment.”",
  "“Strength doesn't come from what you can do. It comes from overcoming what you once couldn't.”",
  "“Consistency is the foundation of peak physical performance.”",
  "“Empowering every member to achieve their highest potential.”",
  "“The pain you feel today will be the strength you feel tomorrow.”"
];

const INITIALIZATION_STAGES = [
  { progress: 18, message: 'Initializing BodyLife Desktop Core...', activeDiags: [] },
  { progress: 42, message: 'Loading Encrypted Local Database & Ledgers...', activeDiags: ['db'] },
  { progress: 72, message: 'Verifying Member Passes, Due Dates & Alerts...', activeDiags: ['db', 'passes'] },
  { progress: 92, message: 'Connecting WhatsApp Cloud & Notification Bridge...', activeDiags: ['db', 'passes', 'cloud'] },
  { progress: 100, message: 'All Systems Operational • Welcome to BodyLife!', activeDiags: ['db', 'passes', 'cloud'] }
];

export default function LoadingScreen({ 
  onFinish, 
  soundEnabled = true, 
  onToggleSound = null,
  minDuration = 2200 
}) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting BodyLife Suite...');
  const [activeDiags, setActiveDiags] = useState([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [quote] = useState(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[idx];
  });

  const hasFinishedRef = useRef(false);

  // Complete and trigger exit sequence
  const handleComplete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    setProgress(100);
    setStatusText('All Systems Operational • Welcome to BodyLife!');
    setActiveDiags(['db', 'passes', 'cloud']);

    if (soundEnabled) {
      playStartupChime();
    }

    // Brief celebratory pause at 100% before smooth fade-out
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 650);
    }, 400);
  };

  // Keyboard shortcut (Escape or Space to skip instantly)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth realistic stepped progress simulation
  useEffect(() => {
    let currentStageIndex = 0;
    const intervalTime = minDuration / 45; // ~45 ticks
    let currentPct = 0;

    const timer = setInterval(() => {
      if (hasFinishedRef.current) {
        clearInterval(timer);
        return;
      }

      // Smooth organic increment with tiny variations
      const increment = Math.max(1, Math.floor(Math.random() * 4) + 1);
      currentPct = Math.min(100, currentPct + increment);
      setProgress(currentPct);

      // Check current stage
      const stage = INITIALIZATION_STAGES.find(s => currentPct <= s.progress) || INITIALIZATION_STAGES[INITIALIZATION_STAGES.length - 1];
      if (stage) {
        setStatusText(stage.message);
        setActiveDiags(stage.activeDiags);
      }

      if (currentPct >= 100) {
        clearInterval(timer);
        handleComplete();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDuration]);

  return (
    <div 
      className={`bodylife-loading-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="BodyLife Gym Management System Loading"
    >
      {/* Ambient Pulsing Background Glow */}
      <div className="bodylife-loading-bg-glow" aria-hidden="true" />

      {/* Top Action Header Bar */}
      <div className="loading-top-bar">
        <div className="loading-system-pill">
          <span className="loading-pulse-dot" />
          <span>System Boot</span>
        </div>

        <div className="loading-top-actions">
          {onToggleSound && (
            <button 
              type="button"
              className="loading-action-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute startup sound' : 'Enable startup sound'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>
          )}

          <button 
            type="button" 
            className="loading-action-btn"
            onClick={handleComplete}
            title="Press Space or Esc to skip"
          >
            <span>Skip</span>
            <FastForward size={13} />
          </button>
        </div>
      </div>

      {/* Center Stage Presentation */}
      <div className="loading-center-content">
        {/* Animated Emblem with Multi-orbit Rings */}
        <div className="loading-logo-wrapper">
          <div className="loading-orbit-ring" aria-hidden="true" />
          <div className="loading-orbit-ring-inner" aria-hidden="true" />
          
          <div className="loading-logo-card">
            <img 
              src={bodylifeLogo} 
              alt="BodyLife Gym Official Logo"
              className="loading-logo-img"
              onError={(e) => { 
                e.currentTarget.src = './bodylife_logo.png'; 
              }}
            />
          </div>
        </div>

        {/* Brand Headline */}
        <div className="loading-brand-header">
          <h1 className="loading-brand-title">
            BodyLife<span className="loading-brand-dot">.</span>
          </h1>
          <p className="loading-brand-subtitle">
            Gym Management & Access System
          </p>
        </div>

        {/* Progress Bar & Real-time Indicator */}
        <div className="loading-progress-container">
          <div className="loading-progress-header">
            <div className="loading-status-text">
              {progress < 100 ? (
                <Loader2 size={15} className="loading-status-icon" />
              ) : (
                <CheckCircle2 size={15} style={{ color: '#10B981' }} />
              )}
              <span>{statusText}</span>
            </div>
            <div className="loading-percent-badge">
              {progress}%
            </div>
          </div>

          <div className="loading-progress-track">
            <div 
              className="loading-progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="loading-progress-shimmer" />
            </div>
          </div>

          {/* Diagnostic Status Indicators */}
          <div className="loading-diagnostics">
            <div className={`loading-diag-chip ${activeDiags.includes('db') ? 'active' : ''}`}>
              <Database size={12} />
              <span>Local Database</span>
            </div>

            <div className={`loading-diag-chip ${activeDiags.includes('passes') ? 'active' : ''}`}>
              <ShieldCheck size={12} />
              <span>Member Ledgers</span>
            </div>

            <div className={`loading-diag-chip ${activeDiags.includes('cloud') ? 'active' : ''}`}>
              <Wifi size={12} />
              <span>Cloud & WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Gym Quote Footer */}
      <div className="loading-footer-quote">
        <p className="loading-quote-text">{quote}</p>
        <span className="loading-version-badge">BodyLife Desktop Suite • v1.0 Production Edition</span>
      </div>
    </div>
  );
}
