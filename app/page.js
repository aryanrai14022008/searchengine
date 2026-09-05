'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS, ARCHETYPES, calculateArchetype } from '@/lib/quizData';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Volume2,
  VolumeX,
  User,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  // 0-8: MCQ Questions (1 to 9), 9: Contact Details (Name, Email, Phone), 10: Thank You Screen
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [answers, setAnswers] = useState({});
  const [computedArchetype, setComputedArchetype] = useState(null);
  const [assignedPassId, setAssignedPassId] = useState('HBL-VIP-8821');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isBarOpened, setIsBarOpened] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

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
          gain.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.55);
        });
      }
    } catch (e) {
      // Audio not supported
    }
  };

  // MCQ Option Select (Steps 0 to 8)
  const handleSelectOption = (questionId, value) => {
    playSound('pop');
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 200);
    } else {
      // 9th question answered -> Advance to Contact Form (Step 9)
      setTimeout(() => {
        setCurrentStep(9);
      }, 200);
    }
  };

  // Step 9: Contact Form Submit -> Save to MongoDB & Show Thank You
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) return;

    setIsSubmitting(true);
    const archetype = calculateArchetype(answers);
    setComputedArchetype(archetype);
    const generatedPass = `HBL-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    setAssignedPassId(generatedPass);

    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          answers: answers
        })
      });
    } catch (err) {
      console.error('Quiz save error:', err);
    } finally {
      setIsSubmitting(false);
      setCurrentStep(10); // Thank You Step
      playSound('fanfare');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setAnswers({});
    setFormData({ name: '', email: '', phone: '' });
    setComputedArchetype(null);
  };

  return (
    <div>
      {/* Header Bar - Clean Minimalist Brand Header */}
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand-logo">
            <span className="logo-text">HUMBL<span>BAR</span></span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          
          <div className="hero-copy">
            
            {/* High-Resolution Large HumblBar Product Sticker */}
            <div className="hero-bar-top-container">
              <div
                className={`hero-bar-sticker-large ${isBarOpened ? 'opened' : ''}`}
                onClick={() => {
                  playSound('pop');
                  const nextState = !isBarOpened;
                  setIsBarOpened(nextState);
                  if (nextState) {
                    confetti({
                      particleCount: 20,
                      spread: 45,
                      origin: { y: 0.3, x: 0.35 }
                    });
                  }
                }}
                title={isBarOpened ? "Click to close" : "Tap to open HumblBar!"}
              >
                {!isBarOpened && (
                  <div className="hero-thought-bubble">
                    <svg viewBox="0 0 170 85" className="thought-cloud-svg" aria-hidden="true">
                      <g fill="#D36C52">
                        <ellipse cx="85" cy="36" rx="64" ry="22" />
                        <circle cx="38" cy="34" r="20" />
                        <circle cx="62" cy="20" r="20" />
                        <circle cx="108" cy="20" r="20" />
                        <circle cx="132" cy="34" r="20" />
                        <circle cx="85" cy="48" r="17" />
                        <circle cx="56" cy="46" r="17" />
                        <circle cx="114" cy="46" r="17" />
                        {/* Thought dots leading to the bar */}
                        <circle cx="76" cy="68" r="4.5" />
                        <circle cx="71" cy="77" r="2.8" />
                      </g>
                      <text x="85" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="var(--font-hand), cursive" letterSpacing="0.06em">
                        TAP TO SEE
                      </text>
                      <text x="85" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="900" fontFamily="var(--font-hand), cursive" letterSpacing="0.02em">
                        WHAT'S INSIDE?
                      </text>
                    </svg>
                  </div>
                )}

                {/* When Closed: The Bar Wrapper Sticker */}
                {!isBarOpened && (
                  <div className="bar-wrapper-visual">
                    <img
                      src="/sticker_bar_clean.png?v=8"
                      srcSet="/sticker_bar_clean.png?v=8 1x, /sticker_bar_hd.png?v=8 2x"
                      alt="HumblBar Clean Protein Bar"
                      className="headline-bar-img"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                )}

                {/* When Opened: Pop up the Plate with Ingredients */}
                {isBarOpened && (
                  <div className="ingredients-plate-popup">
                    <img
                      src="/ingredients_plate.png?v=2"
                      alt="HumblBar Real Ingredients Plate"
                      className="plate-popup-img"
                    />
                    <span className="plate-close-hint">Tap to close</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="hero-headline">
              Snack for you.<br />
              <span className="hero-highlight">Hope for a child.</span>
            </h1>

            <div className="hero-cta-group">
              <a href="#quiz" className="btn-hero-primary">
                <span>Join the waitlist</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Cause Story Notebook (3D Realistic Book Opening Animation on Click) */}
          <div className="book-stage">
            <div 
              className={`book-wrapper ${isBookOpen ? 'is-opened' : 'is-closed'}`}
              onClick={() => {
                playSound('pop');
                setIsBookOpen(prev => !prev);
              }}
            >
              {/* Inside 2-Page Spread (Revealed when open) */}
              <div className="book-pages-spread">
                {/* Left Page: Child Rocket Sketch */}
                <div className="book-page book-left-page">
                  <img
                    src="/dream_rocket_sketch.png?v=snug_1"
                    alt="My Dream child rocket drawing"
                    className="cause-card-photo"
                  />
                  <div className="book-page-gutter-shadow left-gutter" />
                </div>

                {/* Center Spine Crease & Shadow */}
                <div className="book-center-crease">
                  <div className="spine-crease-line" />
                </div>

                {/* Right Page: Clean Story Text */}
                <div className="book-page book-right-page">
                  <div className="cause-stat-highlight">
                    <strong>1 in 4</strong> adolescents in India isn't enrolled in school.
                  </div>

                  <h3 className="cause-story-title">EVERY BAR GIVES BACK !!</h3>

                  <div className="cause-story-body">
                    <p>
                      A childhood belongs in a classroom, not a cycle of survival.<br />
                      Your pin code should never decide your potential.
                    </p>
                    <p>
                      Somewhere right now, a brilliant mind faces a closed door.
                      With every bar you enjoy, you personally open that door.
                      You bring education to their life and hope to their heart.
                    </p>
                  </div>
                  <div className="book-page-gutter-shadow right-gutter" />
                </div>
              </div>

              {/* Translucent Frosted Book Cover with Headline (Flips Open on Click) */}
              <div className="book-front-cover">
                <div className="book-cover-spine" />
                
                <div className="book-cover-plate">
                  <h3 className="book-cover-title decorative-heading">
                    <span className="title-top">EVERY BAR</span>
                    <span className="title-bottom">GIVES BACK</span>
                  </h3>

                  <div className="book-tap-badge">
                    <span>Tap to open</span>
                  </div>
                </div>

                {/* Right Paper Edge Layer for Closed Book */}
                <div className="book-closed-pages-edge" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Main Interactive Archetype Quiz Flow (8 Questions) */}
      <section id="quiz" className="quiz-section">
        <div className="quiz-container">
          
          <div className="section-title-center">
            <h2 className="quiz-movement-heading">
              <span className="quiz-movement-line1">This is More Than a Snack.</span>
              <span className="quiz-movement-line2">It’s a Movement.</span>
            </h2>
          </div>

          <div className="terracotta-card-container">
            <div className="terracotta-card">
              
              {/* Card Header & Only Percentage Completion */}
              <div className="card-header">
                <div className="card-header-top">
                  {currentStep > 0 && currentStep <= 9 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="back-btn"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div style={{ width: '1px' }}></div>
                  )}

                  <div className="percentage-completion-label">
                    {currentStep <= 9 ? `${Math.round((currentStep / 9) * 100)}% Complete` : '100% Complete'}
                  </div>
                </div>

                {/* Progress Track */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Math.round((currentStep / 9) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Steps Viewport */}
              <div className="steps-viewport">
                
                {/* STEPS 0 to 8: Clean MCQ Questions (No category tags, no subtitles) */}
                {currentStep >= 0 && currentStep <= 8 && (
                  <div>
                    <h2 className="step-question">{QUIZ_QUESTIONS[currentStep].question}</h2>

                    <div className="options-container">
                      {QUIZ_QUESTIONS[currentStep].options.map((opt, idx) => {
                        const isSelected = answers[QUIZ_QUESTIONS[currentStep].id] === opt.val;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`option-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(QUIZ_QUESTIONS[currentStep].id, opt.val)}
                          >
                            <span className="opt-num">{idx + 1}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 9: VIP Registration Form (No headers / subtitles) */}
                {currentStep === 9 && (
                  <div>
                    <form onSubmit={handleContactSubmit} className="waitlist-card-form">
                      <div className="form-row">
                        <label className="field-label">Your Full Name *</label>
                        <div className="input-container">
                          <User size={16} className="input-icon" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aryan Rai"
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

                      <button type="submit" disabled={isSubmitting} className="submit-waitlist-btn">
                        <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 10: Clean Thank You Screen */}
                {currentStep === 10 && (
                  <div style={{ textAlign: 'center', padding: '12px 6px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(46, 204, 113, 0.16)',
                      border: '2px solid #2ECC71',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px'
                    }}>
                      <CheckCircle size={32} color="#2ECC71" />
                    </div>

                    <h2 className="step-question" style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.9rem)', margin: '0 0 10px', color: '#FFF' }}>
                      Thank You for Attempting the Quiz{formData.name ? `, ${formData.name.split(' ')[0]}` : ''}!
                    </h2>

                    <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                      Your response has been successfully recorded. 1 nutritious meal has been reserved for a child in need on your behalf.
                    </p>

                    <div>
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="btn-hero-primary"
                        style={{ margin: '0 auto', display: 'inline-flex' }}
                      >
                        <span>Retake Quiz</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

              </div>

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
