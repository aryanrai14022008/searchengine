/**
 * HumblBar Full Experience Engine
 * Automatic Step-by-Step Questionnaire, 3D Tilt Parallax, Web Audio, DNA Synthesizer, Confetti.
 */

// ==========================================
// 1. Audio Synthesizer (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    });
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. Confetti Particle System
// ==========================================
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.colors = ['#F3B562', '#E89578', '#FFFFFF', '#D9455B', '#48CAE4', '#2ECC71'];

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  burst(count = 90) {
    if (!this.canvas) return;
    this.resize();
    this.particles = [];
    const originX = this.canvas.width / 2;
    const originY = this.canvas.height / 3;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: 6 + Math.random() * 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.22,
        friction: 0.98,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.render();
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.render());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// 3. Quiz State & Personality Computation
// ==========================================
const quizState = {
  currentStep: 0,
  totalQuestionSteps: 8,
  answers: {
    role: '',
    weakness: '',
    label: '',
    timing: '',
    protein_timing: '',
    price: '',
    definition: '',
    share: ''
  },
  personality: null,
  userInfo: {
    name: '',
    email: '',
    phone: '',
    queueNum: '#0384'
  }
};

const captions = [
  "Finding your daily snacking rhythm...",
  "Zero judgment — discovering your cravings...",
  "Decoding your ingredient awareness level...",
  "Targeting your afternoon energy slump times...",
  "Calculating your daily protein gap...",
  "Calibrating honest price benchmarks...",
  "Understanding your healthy fuel perception...",
  "Almost there! Designing your sharing profile...",
  "DNA Synthesis Complete!",
  "Claiming your VIP early access...",
  "VIP Access Confirmed! 🎉"
];

function computeSnackDNA(answers) {
  const { role, weakness, label, protein_timing, definition } = answers;

  if (weakness === 'Chocolate' || definition === 'Chocolate pretending to be healthy 😂') {
    return {
      badge: 'THE GUILT-FREE CHOCO-HOLIC',
      emoji: '🍫',
      name: 'The Artisan Cacao Strategist',
      desc: 'You refuse bland, cardboard-tasting snacks. You want authentic rich cocoa and whole foods powered by clean whey and zero refined sugar.',
      protein: 'High (88%)',
      slump: '4:30 PM & Post-Dinner'
    };
  }

  if (role === 'Fitness / sports enthusiast' || protein_timing === 'I struggle throughout the day') {
    return {
      badge: 'THE CLEAN PROTEIN BEAST',
      emoji: '💪',
      name: 'The Relentless Macro Master',
      desc: 'You know your daily RDA protein numbers. You want honest whole-food macros on the go with zero fillers, palm oil, or sugar alcohols.',
      protein: 'Maximal (96%)',
      slump: 'Post-Workout Fuel'
    };
  }

  if (label === 'Every time' || label === 'Sometimes') {
    return {
      badge: 'THE MINDFUL LABEL DETECTIVE',
      emoji: '🧐',
      name: 'The Clean Food Connoisseur',
      desc: 'You read the back of every pack and immediately spot sneaky maltitol, maltodextrin, and chemical preservatives. Transparency is your priority.',
      protein: 'Balanced (85%)',
      slump: 'Mid-Morning Focus'
    };
  }

  return {
    badge: 'THE 4PM POWER STRATEGIST',
    emoji: '⚡',
    name: 'The Mindful Fuel Connoisseur',
    desc: 'You crave wholesome indulgence without the nasty sugar spikes. Real ingredients, clean protein & zero compromises.',
    protein: 'High (88%)',
    slump: '4:30 PM Slump'
  };
}

// ==========================================
// 4. Controller & Handlers
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.quiz-step');
  const progressFill = document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');
  const progressCaption = document.getElementById('progressCaption');
  const stepNumber = document.getElementById('stepNumber');
  const backBtn = document.getElementById('backBtn');
  const soundToggle = document.getElementById('soundToggle');
  const soundOn = document.querySelector('.sound-on');
  const soundOff = document.querySelector('.sound-off');

  const confettiCanvas = document.getElementById('confettiCanvas');
  const confetti = new ConfettiEngine(confettiCanvas);

  // Background Particles
  const particlesBg = document.getElementById('particlesBg');
  if (particlesBg) {
    const emojis = ['🍫', '🥜', '✨', '⚡', '🌰', '🍯', '🌿'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'bg-particle';
      p.textContent = emojis[i % emojis.length];
      p.style.left = `${Math.random() * 95}vw`;
      p.style.fontSize = `${1.2 + Math.random() * 1.5}rem`;
      p.style.animationDuration = `${14 + Math.random() * 16}s`;
      p.style.animationDelay = `-${Math.random() * 16}s`;
      particlesBg.appendChild(p);
    }
  }

  // 3D Parallax Tilt on Product Card
  const productCard3D = document.getElementById('productCard3D');
  if (productCard3D) {
    productCard3D.addEventListener('mousemove', (e) => {
      const rect = productCard3D.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      productCard3D.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    productCard3D.addEventListener('mouseleave', () => {
      productCard3D.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // Scroll CTAs
  const heroStartQuizBtn = document.getElementById('heroStartQuizBtn');
  const navQuizBtn = document.getElementById('navQuizBtn');

  function scrollToQuiz() {
    sfx.playPop();
    const quizSection = document.getElementById('quizSection');
    if (quizSection) {
      quizSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (heroStartQuizBtn) heroStartQuizBtn.addEventListener('click', scrollToQuiz);
  if (navQuizBtn) navQuizBtn.addEventListener('click', scrollToQuiz);

  // Sound Toggle
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      if (sfx.enabled) {
        soundOn.style.display = 'inline';
        soundOff.style.display = 'none';
        sfx.playPop();
      } else {
        soundOn.style.display = 'none';
        soundOff.style.display = 'inline';
      }
    });
  }

  // Go to step function with automatic pop-in
  function goToStep(stepIndex) {
    quizState.currentStep = stepIndex;

    // Toggle active step
    steps.forEach((step, idx) => {
      step.classList.remove('active');
      if (idx === stepIndex) {
        step.classList.add('active');
      }
    });

    // Back button visibility
    if (backBtn) {
      backBtn.style.visibility = (stepIndex > 0 && stepIndex < 9) ? 'visible' : 'hidden';
    }

    // Progress Bar
    const pct = Math.min(100, Math.round(((stepIndex + 1) / (quizState.totalQuestionSteps + 2)) * 100));
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressPct) progressPct.textContent = `${pct}%`;
    if (progressCaption) progressCaption.textContent = captions[stepIndex] || "Discovering your snack DNA...";

    if (stepNumber) {
      if (stepIndex < 8) {
        stepNumber.textContent = `Step ${stepIndex + 1} of 8`;
      } else if (stepIndex === 8) {
        stepNumber.textContent = `DNA Personality Match`;
      } else if (stepIndex === 9) {
        stepNumber.textContent = `VIP Waitlist Form`;
      } else {
        stepNumber.textContent = `VIP Pass Confirmed`;
      }
    }

    // Trigger step 8 personality synthesis
    if (stepIndex === 8) {
      showPersonalityReveal();
    }
  }

  // Option Click -> Auto Advance to Next Question!
  const optionPills = document.querySelectorAll('.option-pill');
  optionPills.forEach(pill => {
    pill.addEventListener('click', function () {
      const parentContainer = this.closest('.options-container');
      const questionKey = parentContainer.getAttribute('data-question');
      const val = this.getAttribute('data-val');

      // Highlight selected pill
      parentContainer.querySelectorAll('.option-pill').forEach(p => p.classList.remove('selected'));
      this.classList.add('selected');

      // Save answer
      quizState.answers[questionKey] = val;
      sfx.playPop();

      // AUTOMATIC ADVANCE: Pop next question after 240ms
      setTimeout(() => {
        if (quizState.currentStep < 7) {
          goToStep(quizState.currentStep + 1);
        } else if (quizState.currentStep === 7) {
          goToStep(8); // Move to personality reveal stage
        }
      }, 240);
    });
  });

  // Back Button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (quizState.currentStep > 0) {
        sfx.playWhoosh();
        goToStep(quizState.currentStep - 1);
      }
    });
  }

  // Keyboard navigation (1-6 keys & Backspace)
  window.addEventListener('keydown', (e) => {
    const activeStep = document.querySelector('.quiz-step.active');
    if (!activeStep) return;
    const stepIdx = parseInt(activeStep.getAttribute('data-step'), 10);

    if (stepIdx >= 0 && stepIdx <= 7) {
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 6) {
        const option = activeStep.querySelector(`.option-pill[data-index="${keyNum}"]`);
        if (option) {
          e.preventDefault();
          option.click();
        }
      } else if (e.key === 'Backspace' && stepIdx > 0) {
        e.preventDefault();
        backBtn.click();
      }
    }
  });

  // Personality Reveal Handler
  function showPersonalityReveal() {
    const loader = document.getElementById('personalityLoader');
    const result = document.getElementById('personalityResult');
    if (loader) loader.style.display = 'block';
    if (result) result.style.display = 'none';

    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      if (result) result.style.display = 'block';

      const dna = computeSnackDNA(quizState.answers);
      quizState.personality = dna;

      document.getElementById('archetypeBadge').textContent = dna.badge;
      document.getElementById('archetypeEmoji').textContent = dna.emoji;
      document.getElementById('archetypeName').textContent = dna.name;
      document.getElementById('archetypeDesc').textContent = dna.desc;
      document.getElementById('mProtein').textContent = dna.protein;
      document.getElementById('mCraving').textContent = dna.slump;

      sfx.playCelebration();
      confetti.burst(60);
    }, 850);
  }

  // Proceed to Waitlist Button
  const proceedWaitlistBtn = document.getElementById('proceedWaitlistBtn');
  if (proceedWaitlistBtn) {
    proceedWaitlistBtn.addEventListener('click', () => {
      sfx.playWhoosh();
      goToStep(9);
    });
  }

  // Waitlist Form Submission
  const waitlistForm = document.getElementById('waitlistCardForm');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const emailInput = document.getElementById('userEmail');
      const phoneInput = document.getElementById('userPhone');

      let hasError = false;

      // Name Validation
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-row').classList.add('has-error');
        hasError = true;
      } else {
        nameInput.closest('.form-row').classList.remove('has-error');
      }

      // Email Validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.closest('.form-row').classList.add('has-error');
        hasError = true;
      } else {
        emailInput.closest('.form-row').classList.remove('has-error');
      }

      // Phone Validation
      const digits = phoneInput.value.replace(/\D/g, '');
      if (digits.length < 10) {
        phoneInput.closest('.form-row').classList.add('has-error');
        hasError = true;
      } else {
        phoneInput.closest('.form-row').classList.remove('has-error');
      }

      if (hasError) {
        sfx.playPop();
        return;
      }

      // Populate Success Details
      const firstName = nameInput.value.trim().split(' ')[0] || 'Friend';
      quizState.userInfo.name = nameInput.value.trim();
      quizState.userInfo.email = emailInput.value.trim();
      quizState.userInfo.phone = digits;
      quizState.userInfo.queueNum = `#0${Math.floor(320 + Math.random() * 85)}`;

      document.getElementById('confirmedUser').textContent = firstName;
      document.getElementById('tName').textContent = quizState.userInfo.name;
      document.getElementById('tQueue').textContent = quizState.userInfo.queueNum;
      if (quizState.personality) {
        document.getElementById('tDNA').textContent = quizState.personality.name;
      }

      const passId = `HBL-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      document.getElementById('tPassId').textContent = passId;
      document.getElementById('refLinkInput').value = `https://humblbar.com/waitlist?ref=${passId.toLowerCase()}`;

      // Advance to Success
      goToStep(10);
      sfx.playCelebration();
      confetti.burst(110);
      setTimeout(() => confetti.burst(60), 400);
      setTimeout(() => confetti.burst(40), 900);
    });
  }

  // Copy Referral Link
  const copyRefBtn = document.getElementById('copyRefBtn');
  if (copyRefBtn) {
    copyRefBtn.addEventListener('click', () => {
      const input = document.getElementById('refLinkInput');
      input.select();
      input.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(input.value);
      copyRefBtn.textContent = 'Copied! 🎉';
      sfx.playPop();
      setTimeout(() => { copyRefBtn.textContent = 'Copy'; }, 2500);
    });
  }

  // Social Share WhatsApp & Twitter
  const shareWaBtn = document.getElementById('shareWaBtn');
  if (shareWaBtn) {
    shareWaBtn.addEventListener('click', () => {
      const text = encodeURIComponent(`I just found my Snack Personality on HumblBar! 🍫 15g clean protein, 0g added sugar & 1 meal pledged for a child. Claim your VIP pass: https://humblbar.com`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  const shareTwBtn = document.getElementById('shareTwBtn');
  if (shareTwBtn) {
    shareTwBtn.addEventListener('click', () => {
      const text = encodeURIComponent(`Found my snack DNA with @HumblBar! 🍫 15g clean protein & 1 Bar = 1 Meal for a child. Join the VIP waitlist:`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://humblbar.com`, '_blank');
    });
  }

  // Retake Quiz Button
  const retakeQuizBtn = document.getElementById('retakeQuizBtn');
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', () => {
      sfx.playWhoosh();
      document.querySelectorAll('.option-pill').forEach(p => p.classList.remove('selected'));
      for (const k in quizState.answers) quizState.answers[k] = '';
      if (waitlistForm) waitlistForm.reset();
      goToStep(0);
    });
  }

  // Live Toast Social Proof
  const liveToast = document.getElementById('liveToast');
  const toastUser = document.getElementById('toastUser');
  const mockNames = [
    "Aarav from Bengaluru",
    "Priya from Mumbai",
    "Kabir from Delhi",
    "Sneha from Pune",
    "Ananya from Hyderabad",
    "Vikram from Chennai"
  ];
  let toastIndex = 0;

  function triggerToast() {
    if (!liveToast || !toastUser) return;
    toastUser.textContent = mockNames[toastIndex % mockNames.length];
    toastIndex++;
    liveToast.classList.add('show');
    setTimeout(() => {
      liveToast.classList.remove('show');
    }, 4000);
  }

  setInterval(triggerToast, 10000);
  setTimeout(triggerToast, 3000);

  // Live Meal Counter Incrementer
  const liveMealCounter = document.getElementById('liveMealCounter');
  if (liveMealCounter) {
    let mealCount = 12482;
    setInterval(() => {
      mealCount += Math.floor(Math.random() * 2) + 1;
      liveMealCounter.textContent = mealCount.toLocaleString('en-IN');
    }, 6000);
  }
});
