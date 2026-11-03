/* ==========================================================================
   ALEX RIVERA - PORTFOLIO INTERACTIVE APP (SCRIPT.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. STATE & UTILITIES
  // --------------------------------------------------------------------------
  const state = {
    theme: localStorage.getItem('ar_theme') || 'dark',
    soundEnabled: localStorage.getItem('ar_sound') === 'true',
    audioCtx: null
  };

  // Helper Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    playSound(type === 'success' ? 600 : 400);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Web Audio Synth for Subtle Click Cues
  function playSound(freq = 440) {
    if (!state.soundEnabled) return;
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --------------------------------------------------------------------------
  // 2. THEME & SOUND CONTROLS
  // --------------------------------------------------------------------------
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const soundToggle = document.getElementById('soundToggle');

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('ar_theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }
  }

  applyTheme(state.theme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      showToast(`Switched to ${state.theme.toUpperCase()} theme`, 'info');
    });
  }

  if (soundToggle) {
    function updateSoundIcon() {
      soundToggle.innerHTML = state.soundEnabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
    }
    updateSoundIcon();

    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('ar_sound', state.soundEnabled);
      updateSoundIcon();
      showToast(state.soundEnabled ? 'UI Audio Enabled' : 'UI Audio Muted', 'info');
    });
  }

  // --------------------------------------------------------------------------
  // 3. CURSOR TRAILER & NAVBAR SCROLL
  // --------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursorGlow');
  window.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }
  });

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Navigation Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE HERO CANVAS (CONSTELLATION PHYSICS)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 65;
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Magnet Effect
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = state.theme === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.4)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Draw Connection Lines
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            let opacity = (1 - dist / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = state.theme === 'dark' 
              ? `rgba(6, 182, 212, ${opacity})` 
              : `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateCanvas);
    }

    animateCanvas();
  }

  // --------------------------------------------------------------------------
  // 5. HERO AUTO-TYPING CAROUSEL
  // --------------------------------------------------------------------------
  const typingElement = document.getElementById('typingText');
  if (typingElement) {
    const roles = [
      'Full-Stack Developer',
      'ECE Engineer',
      'Java Programmer',
      'MERN Stack Builder'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentRole.length) {
        speed = 2200; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400;
      }

      setTimeout(typeEffect, speed);
    }

    typeEffect();
  }

  // --------------------------------------------------------------------------
  // 6. METRICS COUNTER ANIMATION
  // --------------------------------------------------------------------------
  const statValues = document.querySelectorAll('.stat-value');
  let animatedStats = false;

  function runCounters() {
    statValues.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      let count = 0;
      const step = Math.ceil(target / 40);

      const updateCount = () => {
        count += step;
        if (count >= target) {
          counter.textContent = target;
        } else {
          counter.textContent = count;
          setTimeout(updateCount, 30);
        }
      };

      updateCount();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedStats) {
        animatedStats = true;
        runCounters();
      }
    });
  }, { threshold: 0.5 });

  const statsGrid = document.querySelector('.hero-stats-grid');
  if (statsGrid) observer.observe(statsGrid);

  // --------------------------------------------------------------------------
  // 7. ABOUT TABS & 3D TILT EFFECT
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound(520);
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // 3D Tilt Card Effect
  const avatarContainer = document.getElementById('aboutAvatarContainer');
  if (avatarContainer) {
    avatarContainer.addEventListener('mousemove', (e) => {
      const rect = avatarContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 12;
      const rotateY = (x / rect.width) * 12;

      avatarContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    avatarContainer.addEventListener('mouseleave', () => {
      avatarContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // --------------------------------------------------------------------------
  // 8. SKILLS MATRIX FILTERING & SEARCH
  // --------------------------------------------------------------------------
  const skillCatBtns = document.querySelectorAll('.skill-cat-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const skillSearchInput = document.getElementById('skillSearchInput');

  function filterSkills() {
    const activeCat = document.querySelector('.skill-cat-btn.active')?.getAttribute('data-category') || 'all';
    const query = skillSearchInput?.value.toLowerCase().trim() || '';

    skillCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const name = card.getAttribute('data-name').toLowerCase();

      const matchesCat = (activeCat === 'all' || cat === activeCat);
      const matchesQuery = name.includes(query);

      if (matchesCat && matchesQuery) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  skillCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound(480);
      skillCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterSkills();
    });
  });

  if (skillSearchInput) {
    skillSearchInput.addEventListener('input', filterSkills);
  }

  // --------------------------------------------------------------------------
  // 9. PROJECTS SHOWCASE & CASE STUDY MODALS
  // --------------------------------------------------------------------------
  const projFilterBtns = document.querySelectorAll('.proj-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound(500);
      projFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Case Studies Database
  const caseStudiesData = {
    'proj-1': {
      title: 'Department System Monitoring Portal',
      category: 'Full-Stack Web App',
      timeline: 'Completed',
      role: 'Full-Stack Developer',
      problem: 'Managing complaints, repairs, system assets, and departmental data across users needed a centralized web tracking platform.',
      solution: 'Built and deployed a full-stack application using Node.js, Express.js, and MongoDB with REST APIs. Implemented secure authentication and real-time tracking dashboards.',
      techStack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'GitHub', 'Render'],
      metrics: [
        { label: 'Security', value: 'JWT Auth' },
        { label: 'Deployment', value: 'Render Live' },
        { label: 'Efficiency', value: 'High' }
      ]
    },
    'proj-2': {
      title: 'Train Ticket Booking System',
      category: 'Frontend Application',
      timeline: 'Completed',
      role: 'Frontend Developer',
      problem: 'Users required a responsive, seamless interface for searching train routes, picking preferred seats, and managing booking history.',
      solution: 'Developed an interactive application with route search filters (departure, arrival, date), seat grid selection, and persistent booking navigation using vanilla JavaScript.',
      techStack: ['HTML5', 'CSS3', 'JavaScript'],
      metrics: [
        { label: 'Interface', value: 'Responsive' },
        { label: 'Theme Support', value: 'Light/Dark' },
        { label: 'Features', value: 'Interactive' }
      ]
    },
    'proj-3': {
      title: 'Product Manager Pro',
      category: 'Inventory Web App',
      timeline: 'Completed',
      role: 'Frontend Developer',
      problem: 'Businesses need clean and error-free inventory product listing management.',
      solution: 'Designed a modal-based product entry interface with required-field validation for organizing products by name, price, stock, category, and description.',
      techStack: ['HTML5', 'CSS3', 'JavaScript'],
      metrics: [
        { label: 'Validation', value: '100% Form' },
        { label: 'UI Layout', value: 'Modal-based' },
        { label: 'UX Speed', value: 'Instant' }
      ]
    },
    'proj-4': {
      title: 'Smart Irrigation Leakage Detection',
      category: 'Award-Winning Hardware & Software System',
      timeline: 'Completed (Exhibition 2026)',
      role: 'Project Developer',
      problem: 'Water wastage in agricultural irrigation due to undetectable underground pipeline leakages.',
      solution: 'Developed an automated system using flow & moisture sensors to continuously monitor irrigation lines, identify leak positions in real time, and reduce water loss.',
      techStack: ['Java', 'C++', 'Embedded Sensors', 'Real-time Telemetry'],
      metrics: [
        { label: 'Recognition', value: '3rd Prize' },
        { label: 'Event', value: 'Exhibition 2026' },
        { label: 'Water Saved', value: 'Significant' }
      ]
    }
  };

  const caseStudyModal = document.getElementById('caseStudyModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBodyContent = document.getElementById('modalBodyContent');

  function openCaseStudy(projId) {
    const data = caseStudiesData[projId];
    if (!data || !modalBodyContent || !caseStudyModal) return;

    modalBodyContent.innerHTML = `
      <div class="modal-header-section">
        <span class="section-tag">${data.category}</span>
        <h2 class="modal-project-title">${data.title}</h2>
        
        <div class="modal-meta-grid">
          <div class="modal-meta-item">
            <span>Role:</span>
            <strong>${data.role}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Timeline:</span>
            <strong>${data.timeline}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Status:</span>
            <strong>Production Live</strong>
          </div>
        </div>
      </div>

      <h3 class="modal-section-h3"><i class="fa-solid fa-triangle-exclamation"></i> The Challenge</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">${data.problem}</p>

      <h3 class="modal-section-h3"><i class="fa-solid fa-lightbulb"></i> Engineering Solution</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">${data.solution}</p>

      <h3 class="modal-section-h3"><i class="fa-solid fa-cubes"></i> Architecture Stack</h3>
      <div class="tech-pills" style="margin-bottom: 2rem;">
        ${data.techStack.map(t => `<span class="tech-pill">${t}</span>`).join('')}
      </div>

      <h3 class="modal-section-h3"><i class="fa-solid fa-chart-pie"></i> Verified Key Metrics</h3>
      <div class="hero-stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 1rem; padding: 1.25rem;">
        ${data.metrics.map(m => `
          <div class="stat-card">
            <div class="stat-value" style="font-size: 1.8rem; color: var(--accent-secondary);">${m.value}</div>
            <div class="stat-label">${m.label}</div>
          </div>
        `).join('')}
      </div>
    `;

    caseStudyModal.classList.add('active');
    playSound(550);
  }

  document.querySelectorAll('.view-case-study-btn, .case-study-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openCaseStudy(id);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      caseStudyModal.classList.remove('active');
    });
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) {
        caseStudyModal.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. EXPERIENCE TRACK SWITCHER
  // --------------------------------------------------------------------------
  const timelineSwitchBtns = document.querySelectorAll('.timeline-switch-btn');
  const timelineTracks = document.querySelectorAll('.timeline-track');

  timelineSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound(480);
      timelineSwitchBtns.forEach(b => b.classList.remove('active'));
      timelineTracks.forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetTrack = document.getElementById(targetId);
      if (targetTrack) targetTrack.classList.add('active');
    });
  });

  // --------------------------------------------------------------------------
  // 11. INTERACTIVE PROJECT SCOPE & COST ESTIMATOR ENGINE
  // --------------------------------------------------------------------------
  const estTypeInputs = document.querySelectorAll('input[name="projectType"]');
  const estTimeInputs = document.querySelectorAll('input[name="timeline"]');
  const estFeatureInputs = document.querySelectorAll('.est-feature');

  const estDisplayType = document.getElementById('estDisplayType');
  const estDisplayTimeline = document.getElementById('estDisplayTimeline');
  const estDisplayCount = document.getElementById('estDisplayCount');
  const estDisplayPrice = document.getElementById('estDisplayPrice');
  const estApplyToContactBtn = document.getElementById('estApplyToContactBtn');

  const basePrices = {
    saas: 3500,
    ai: 4500,
    landing: 2200
  };

  const timelineMultipliers = {
    express: 1.35,
    standard: 1.0,
    thorough: 0.9
  };

  const timelineNames = {
    express: 'Express (2 Wks)',
    standard: 'Standard (4-6 Wks)',
    thorough: 'Enterprise (8+ Wks)'
  };

  const featurePriceMap = {
    auth: 500,
    payments: 800,
    websockets: 900,
    analytics: 600,
    ai_agent: 1200
  };

  function updateEstimate() {
    // Selected Type
    const selectedTypeEl = document.querySelector('input[name="projectType"]:checked');
    const selectedType = selectedTypeEl ? selectedTypeEl.value : 'saas';
    const base = basePrices[selectedType] || 3500;

    // Option Card Active States
    document.querySelectorAll('input[name="projectType"]').forEach(radio => {
      const card = radio.closest('.est-option-card');
      if (card) {
        if (radio.checked) card.classList.add('active');
        else card.classList.remove('active');
      }
    });

    // Selected Timeline
    const selectedTimeEl = document.querySelector('input[name="timeline"]:checked');
    const selectedTimeline = selectedTimeEl ? selectedTimeEl.value : 'standard';
    const timeMult = timelineMultipliers[selectedTimeline] || 1.0;

    document.querySelectorAll('input[name="timeline"]').forEach(radio => {
      const card = radio.closest('.est-option-card');
      if (card) {
        if (radio.checked) card.classList.add('active');
        else card.classList.remove('active');
      }
    });

    // Selected Features
    let featuresTotal = 0;
    let checkedCount = 0;

    estFeatureInputs.forEach(input => {
      if (input.checked) {
        checkedCount++;
        featuresTotal += (featurePriceMap[input.value] || 400);
      }
    });

    // Calculate Range
    const rawTotal = (base + featuresTotal) * timeMult;
    const minPrice = Math.round(rawTotal * 0.9 / 100) * 100;
    const maxPrice = Math.round(rawTotal * 1.15 / 100) * 100;

    // Update UI DOM
    if (estDisplayType) {
      const typeLabels = { saas: 'SaaS Web App', ai: 'AI Integration', landing: 'Design & Site' };
      estDisplayType.textContent = typeLabels[selectedType] || 'Web App';
    }

    if (estDisplayTimeline) {
      estDisplayTimeline.textContent = timelineNames[selectedTimeline] || 'Standard';
    }

    if (estDisplayCount) {
      estDisplayCount.textContent = `${checkedCount} Capabilities`;
    }

    if (estDisplayPrice) {
      estDisplayPrice.textContent = `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
    }
  }

  // Event Listeners for Estimator Controls
  estTypeInputs.forEach(i => i.addEventListener('change', () => { playSound(450); updateEstimate(); }));
  estTimeInputs.forEach(i => i.addEventListener('change', () => { playSound(450); updateEstimate(); }));
  estFeatureInputs.forEach(i => i.addEventListener('change', () => { playSound(450); updateEstimate(); }));

  updateEstimate();

  // Apply Estimate to Contact Form
  if (estApplyToContactBtn) {
    estApplyToContactBtn.addEventListener('click', () => {
      playSound(600);
      const estType = estDisplayType?.textContent || 'Web App';
      const estTime = estDisplayTimeline?.textContent || 'Standard';
      const estPrice = estDisplayPrice?.textContent || '$5,000';

      const messageInput = document.getElementById('contactMessage');
      if (messageInput) {
        messageInput.value = `Hi Alex, I ran your Project Scope Estimator:\n- Project Type: ${estType}\n- Desired Timeline: ${estTime}\n- Estimated Scope: ${estPrice}\n\nI would love to discuss initiating this project with you.`;
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Estimate copied to message form!', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // 12. CONTACT FORM VALIDATION & AJAX SIMULATION
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const submitFormBtn = document.getElementById('submitFormBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (!isValid) {
        playSound(300);
        return;
      }

      // Simulate Form Submission
      if (submitFormBtn) {
        const originalText = submitFormBtn.innerHTML;
        submitFormBtn.disabled = true;
        submitFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting...';

        setTimeout(() => {
          submitFormBtn.disabled = false;
          submitFormBtn.innerHTML = originalText;
          contactForm.reset();
          showToast('Message transmitted successfully! Alex will reply shortly.', 'success');
        }, 1500);
      }
    });
  }

  // Copy Email to Clipboard
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        showToast(`Copied ${textToCopy} to clipboard!`, 'info');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 13. LIVE CLOCK DISPLAY
  // --------------------------------------------------------------------------
  const localClock = document.getElementById('localClock');
  function updateClock() {
    if (!localClock) return;
    const now = new Date();
    // Local SF / User time display
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    localClock.textContent = `${timeStr} PST`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  // --------------------------------------------------------------------------
  // 14. KEYBOARD NAVIGATION SHORTCUTS
  // --------------------------------------------------------------------------
  const shortcutsModal = document.getElementById('shortcutsModal');
  const shortcutsCloseBtn = document.getElementById('shortcutsCloseBtn');

  window.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts if user is typing inside an input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    const key = e.key.toUpperCase();

    if (key === '?') {
      if (shortcutsModal) shortcutsModal.classList.toggle('active');
    } else if (key === 'ESCAPE') {
      if (caseStudyModal) caseStudyModal.classList.remove('active');
      if (shortcutsModal) shortcutsModal.classList.remove('active');
    } else if (key === 'H') {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'A') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'S') {
      document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'P') {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'E') {
      document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'C') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else if (key === 'T') {
      if (themeToggle) themeToggle.click();
    }
  });

  if (shortcutsCloseBtn && shortcutsModal) {
    shortcutsCloseBtn.addEventListener('click', () => {
      shortcutsModal.classList.remove('active');
    });

    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) shortcutsModal.classList.remove('active');
    });
  }
});
