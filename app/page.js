'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS, ARCHETYPES, calculateArchetype } from '@/lib/quizData';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Heart,
  Volume2,
  VolumeX,
  User,
  Mail,
  Phone
} from 'lucide-react';

const CHOCOLATE_PARTICLES = [
  { icon: '🍫', left: '5%', size: '2.2rem', duration: '17s', delay: '-2s', opacity: 0.38 },
  { icon: '🌰', left: '16%', size: '1.6rem', duration: '22s', delay: '-8s', opacity: 0.32 },
  { icon: '🍫', left: '27%', size: '2.5rem', duration: '16s', delay: '-14s', opacity: 0.42 },
  { icon: '🌴', left: '38%', size: '1.8rem', duration: '20s', delay: '-5s', opacity: 0.3 },
  { icon: '✨', left: '49%', size: '1.3rem', duration: '15s', delay: '-11s', opacity: 0.45 },
  { icon: '🍫', left: '60%', size: '2.2rem', duration: '19s', delay: '-1s', opacity: 0.38 },
  { icon: '🌰', left: '71%', size: '1.7rem', duration: '24s', delay: '-16s', opacity: 0.32 },
  { icon: '🍫', left: '82%', size: '2.6rem', duration: '18s', delay: '-7s', opacity: 0.44 },
  { icon: '🌴', left: '91%', size: '1.9rem', duration: '21s', delay: '-13s', opacity: 0.32 },
  { icon: '🤎', left: '96%', size: '1.5rem', duration: '19s', delay: '-4s', opacity: 0.35 },
  { icon: '🍫', left: '11%', size: '2rem', duration: '23s', delay: '-17s', opacity: 0.36 },
  { icon: '✨', left: '85%', size: '1.4rem', duration: '14s', delay: '-9s', opacity: 0.42 }
];

export default function HomePage() {
  // 0: Details Gate (Name, Email, Phone), 1-8: MCQ Questions, 9: Thank You & Personality Reveal
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [answers, setAnswers] = useState({});
  const [computedArchetype, setComputedArchetype] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Web Audio FX Engine
  const playSound = (type = 'pop') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const t = now + idx * 0.08;
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.55);
        });
      }
    } catch (e) {
      // Audio not supported
    }
  };

  // Step 0: Gate Form Submit
  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) return;
    playSound('pop');
    setCurrentStep(1); // Proceed to first question
  };

  // MCQ Option Select (Steps 1 to 8)
  const handleSelectOption = async (questionId, value) => {
    playSound('pop');
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    const questionIndex = currentStep - 1;
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 250);
    } else {
      // Last question answered -> Compute Archetype & Store to MongoDB / Admin API
      const archetype = calculateArchetype(updatedAnswers);
      setComputedArchetype(archetype);
      setIsSubmitting(true);

      try {
        await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            answers: updatedAnswers
          })
        });
      } catch (err) {
        console.error('Quiz save error:', err);
      } finally {
        setIsSubmitting(false);
        setCurrentStep(9); // Thank You Step
        playSound('fanfare');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setAnswers({});
    setComputedArchetype(null);
  };

  return (
    <div>
      {/* Ambient Floating Glows */}
      <div className="ambient-glow glow-1" aria-hidden="true"></div>
      <div className="ambient-glow glow-2" aria-hidden="true"></div>
      <div className="ambient-glow glow-3" aria-hidden="true"></div>

      {/* Floating Chocolate Animation Layer */}
      <div className="particles-bg" aria-hidden="true">
        {CHOCOLATE_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="floating-chocolate-item"
            style={{
              left: p.left,
              fontSize: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
              '--particle-opacity': p.opacity
            }}
          >
            {p.icon}
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand-logo">
            <span className="logo-text">HUMBL<span>BAR</span></span>
          </a>

          <div className="header-center-pill">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={14} fill="#F3B562" /> 1 Bar = 1 Nutritious Child Meal
            </span>
          </div>

          <div className="header-actions">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <a href="#quiz" className="btn-nav-quiz">
              <span>Take Quiz</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          
          <div className="hero-copy">
            <div className="hero-badge">
              <span>CLEAN SNACKING &bull; REAL SOCIAL IMPACT</span>
            </div>

            <h1 className="hero-headline">
              Snack for you.<br />
              <span className="gradient-text">Hope for a child.</span>
            </h1>

            <p className="hero-subtext">
              Take our 60-second interactive quiz to uncover your unique <strong>Snack Personality</strong> and help pledge a nutritious meal to a child in need.
            </p>

            <div className="hero-stats-row">
              <div className="stat-pill">
                <span className="stat-value">60s</span>
                <span className="stat-label">Snack Quiz</span>
              </div>
              <div className="stat-pill">
                <span className="stat-value">1 = 1</span>
                <span className="stat-label">Child Meal Pledged</span>
              </div>
              <div className="stat-pill">
                <span className="stat-value">100%</span>
                <span className="stat-label">Wholesome Cause</span>
              </div>
            </div>

            <div className="hero-cta-group">
              <a href="#quiz" className="btn-hero-primary">
                <span>Start Your Snack Quiz</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Directed Visual: Classroom Dream & Cause Story Card */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div className="sticky-tag tag-water">Drink 3L water</div>
            <div className="sticky-tag tag-protein">Eating 50g protein</div>

            <div className="dream-story-card">
              <div className="dream-card-inner">
                {/* Left: Notebook Sketch */}
                <div className="dream-sketch-side">
                  <div>
                    <div className="sketch-header">My Dream</div>
                    <div className="sketch-sub">When I grow up, I want to be...</div>
                  </div>

                  <div className="sketch-illustration">
                    <svg viewBox="0 0 200 135" className="sketch-rocket-svg" fill="none">
                      {/* Sun */}
                      <circle cx="170" cy="22" r="12" fill="#F3B562" />
                      <path d="M170 6 L170 10 M170 34 L170 38 M154 22 L158 22 M182 22 L186 22 M158 10 L162 14 M178 30 L182 34" stroke="#E27D60" strokeWidth="2" strokeLinecap="round" />
                      {/* Planets */}
                      <circle cx="28" cy="38" r="9" fill="#9B5DE5" opacity="0.8" />
                      <ellipse cx="28" cy="38" rx="14" ry="3.5" stroke="#D48468" strokeWidth="1.5" transform="rotate(-20 28 38)" />
                      <circle cx="155" cy="80" r="6" fill="#F15BB5" opacity="0.8" />
                      {/* Stars */}
                      <path d="M60 18 L62 23 L67 23 L63 26 L65 31 L60 28 L55 31 L57 26 L53 23 L58 23 Z" fill="#F3B562" />
                      <path d="M180 98 L181 101 L184 101 L182 103 L183 106 L180 104 L177 106 L178 103 L176 101 L179 101 Z" fill="#F3B562" />
                      {/* Rocket */}
                      <path d="M100 15 C85 35 80 72 80 90 L120 90 C120 72 115 35 100 15 Z" fill="#E63946" stroke="#1D3557" strokeWidth="2" />
                      <path d="M85 90 L100 20 L115 90 Z" fill="#FFF" />
                      {/* Window */}
                      <circle cx="100" cy="48" r="11" fill="#A8DADC" stroke="#1D3557" strokeWidth="2" />
                      <circle cx="100" cy="48" r="6" fill="#457B9D" />
                      {/* Fins */}
                      <path d="M80 70 L65 90 L80 90 Z" fill="#E63946" stroke="#1D3557" strokeWidth="2" />
                      <path d="M120 70 L135 90 L120 90 Z" fill="#E63946" stroke="#1D3557" strokeWidth="2" />
                      {/* Rocket Flame */}
                      <path d="M86 90 Q100 125 114 90 Q100 108 86 90 Z" fill="#F3B562" />
                      <path d="M92 90 Q100 112 108 90 Z" fill="#E63946" />
                      {/* Clouds */}
                      <path d="M15 125 Q30 105 50 125 Q65 110 85 125 Z" fill="#EBF4F6" stroke="#B8D5E5" strokeWidth="1.5" />
                      <path d="M130 130 Q150 110 175 130 Q190 115 200 130 Z" fill="#EBF4F6" stroke="#B8D5E5" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.95rem', color: '#718096', textAlign: 'center' }}>
                    Fueling bright futures, one meal at a time.
                  </div>
                </div>

                {/* Right: Directed Text */}
                <div className="dream-copy-side">
                  <h2 className="dream-headline">
                    Behind every classroom is a <strong>dream.</strong>
                  </h2>
                  <p className="dream-desc">
                    Every Humbl Bar helps create opportunities for children through education.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Terracotta Step-by-Step Quiz */}
      <section className="quiz-section" id="quiz">
        <div className="quiz-section-header">
          <span className="section-tag">60-SECOND INTERACTIVE QUIZ</span>
          <h2 className="section-heading">Uncover Your Snack DNA</h2>
          <p className="section-sub">
            {currentStep === 0
              ? 'Enter your details below to start your personalized 60-second quiz.'
              : currentStep <= 8
              ? 'Answer each question below — the quiz advances automatically.'
              : 'Your personalized profile is ready!'}
          </p>
        </div>

        <div className="terracotta-card-container">
          <div className="terracotta-card">
            
            {/* Card Progress Header */}
            <div className="card-header">
              <div className="card-header-top">
                {currentStep > 1 && currentStep <= 8 ? (
                  <button type="button" className="back-btn" onClick={() => setCurrentStep(prev => prev - 1)}>
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div style={{ width: '48px' }}></div>
                )}

                <div className="sub-header-title">
                  <span className="header-main-tag">DISCOVER YOUR SNACK PERSONALITY</span>
                  <span className="header-sub-tag">Snack for you. Hope for a child.</span>
                </div>

                <div className="step-counter-pill">
                  <span>
                    {currentStep === 0
                      ? 'Start'
                      : currentStep <= 8
                      ? `Question ${currentStep} of 8`
                      : 'Completed'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-wrapper">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        currentStep === 0
                          ? '10%'
                          : currentStep <= 8
                          ? `${((currentStep) / 8) * 100}%`
                          : '100%'
                    }}
                  ></div>
                </div>
                <div className="progress-details">
                  <span>
                    {currentStep === 0
                      ? 'Step 1: Your Details'
                      : currentStep <= 8
                      ? 'Analyzing daily habits...'
                      : 'Thank You! Completed'}
                  </span>
                  <span>
                    {currentStep === 0
                      ? '10%'
                      : currentStep <= 8
                      ? `${Math.round(((currentStep) / 8) * 100)}%`
                      : '100%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Viewport */}
            <div className="steps-viewport">
              
              {/* STEP 0: Blocked Gate - Enter Name, Email, Phone */}
              {currentStep === 0 && (
                <div>
                  <div className="step-category">GET STARTED</div>
                  <h2 className="step-question">Tell us about yourself</h2>
                  <p className="step-sub">Enter your details to unlock your custom Snack DNA Quiz and pledge a child meal.</p>

                  <form onSubmit={handleStartQuiz} className="waitlist-card-form">
                    <div className="form-row">
                      <label className="field-label">Your Name *</label>
                      <div className="input-container">
                        <User size={16} className="input-icon" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aryan Sharma"
                          className="input-field"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="field-label">Email Address *</label>
                      <div className="input-container">
                        <Mail size={16} className="input-icon" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. aryan@example.com"
                          className="input-field"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="field-label">Phone / WhatsApp *</label>
                      <div className="input-container">
                        <Phone size={16} className="input-icon" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          className="input-field"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="submit-waitlist-btn">
                      <span>Start 60-Second Quiz</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}

              {/* STEPS 1 to 8: Clean MCQ Questions (Numbered, No Emojis) */}
              {currentStep >= 1 && currentStep <= 8 && (
                <div>
                  <div className="step-category">{QUIZ_QUESTIONS[currentStep - 1].category}</div>
                  <h2 className="step-question">{QUIZ_QUESTIONS[currentStep - 1].question}</h2>
                  <p className="step-sub">{QUIZ_QUESTIONS[currentStep - 1].subtitle}</p>

                  <div className="options-container">
                    {QUIZ_QUESTIONS[currentStep - 1].options.map((opt, idx) => {
                      const isSelected = answers[QUIZ_QUESTIONS[currentStep - 1].id] === opt.val;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`option-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(QUIZ_QUESTIONS[currentStep - 1].id, opt.val)}
                        >
                          <span className="opt-num">{idx + 1}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 9: Clean Thank You & Personality Reveal */}
              {currentStep === 9 && computedArchetype && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2ECC71', color: '#140C08', padding: '5px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '10px' }}>
                      <CheckCircle size={15} /> RESPONSE RECORDED
                    </div>
                    <h2 className="step-question" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: 0 }}>
                      Thank You, {formData.name.split(' ')[0]}!
                    </h2>
                    <p className="step-sub" style={{ marginTop: '6px', color: '#FFF' }}>
                      1 nutritious meal has been reserved for a child in need on your behalf.
                    </p>
                  </div>

                  <div className="hologram-personality-card">
                    <div className="holo-badge">{computedArchetype.title}</div>
                    <h3 className="holo-archetype-name">{computedArchetype.name}</h3>
                    <p className="holo-archetype-desc">{computedArchetype.description}</p>

                    <div className="holo-metrics-grid">
                      <div className="h-metric">
                        <span>Energy Focus</span>
                        <strong>{computedArchetype.proteinNeed}</strong>
                      </div>
                      <div className="h-metric">
                        <span>Peak Slump</span>
                        <strong>{computedArchetype.cravingTime}</strong>
                      </div>
                      <div className="h-metric">
                        <span>Snack Awareness</span>
                        <strong>{computedArchetype.cleanLabelScore}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '18px' }}>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="btn-hero-primary"
                      style={{ padding: '10px 24px', fontSize: '0.88rem', margin: '0 auto', display: 'inline-flex' }}
                    >
                      <span>Take Quiz Again</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-inner">
            <div>
              <div className="logo-text">HUMBL<span>BAR</span></div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.84rem', marginTop: '4px' }}>
                Clean fuel for you &bull; Wholesome hope for a child.
              </p>
            </div>
            <div>
              <a href="#quiz" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Snack Quiz</a>
            </div>
          </div>
          <div className="footer-copy">
            &copy; 2026 HumblBar Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
