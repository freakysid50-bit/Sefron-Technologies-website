/**
 * SEFRON TECHNOLOGIES - Core Application Logic
 * Navigation, Scroll Spying, Modals, Dynamic UI Interactivity.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header State
  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 30) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 1b. Centerpiece Logo Interactive 3D Subtle Tilt & Shake Dynamics
  const centerpieceWrapper = document.getElementById('centerpieceLogoWrapper');
  if (centerpieceWrapper) {
    centerpieceWrapper.addEventListener('mousemove', (e) => {
      const rect = centerpieceWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      centerpieceWrapper.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.04)`;
    });

    centerpieceWrapper.addEventListener('mouseleave', () => {
      centerpieceWrapper.style.transform = '';
    });
  }

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu(open) {
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    if (isOpen) {
      mobileDrawer.classList.add('open');
      mobileBackdrop.classList.add('open');
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => toggleMobileMenu());
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // 3. Scroll Spy for Active Navigation Link
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });

        mobileNavLinks.forEach(mLink => {
          mLink.classList.remove('active');
          if (mLink.getAttribute('href') === `#${id}`) {
            mLink.classList.add('active');
          }
        });
      }
    });
  }

  // Throttled Scroll Processing for Header State & Active Nav Spy
  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        updateActiveNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  handleScroll();
  updateActiveNav();

  // Smooth Anchor Navigation with Sticky Header Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Close mobile drawer cleanly if open
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          toggleMobileMenu(false);
        }

        const headerOffset = 76;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // 4. Reveal On Scroll Animations
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 5. Service Modal System
  const serviceModal = document.getElementById('serviceModal');
  const modalTitle = document.getElementById('modalServiceTitle');
  const modalContent = document.getElementById('modalServiceContent');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalOverlay = document.getElementById('serviceModal');

  const serviceData = {
    web: {
      title: 'Web Development',
      badge: 'B2B & Enterprise Web Engineering',
      desc: 'We build high-performance, responsive, and secure web applications tailored for modern businesses. From corporate portals to complex cloud platforms, our engineering ensures lightning-fast load times and seamless cross-device fidelity.',
      deliverables: [
        'Corporate & Business Websites',
        'E-Commerce & Digital Commerce Platforms',
        'High-Converting Landing Pages',
        'Enterprise Admin Dashboards',
        'Scalable Web Applications (SPA / PWA)',
        'API Integration & CMS Architectures'
      ]
    },
    mobile: {
      title: 'Mobile App Development',
      badge: 'iOS, Android & Cross-Platform Apps',
      desc: 'We engineer intuitive, feature-rich mobile applications built for both business workflows and customer engagement. Our apps combine silky native performance with clean UI architecture.',
      deliverables: [
        'Native Android Applications (Kotlin)',
        'Native iOS Applications (Swift)',
        'Cross-Platform Applications (Flutter / React Native)',
        'Enterprise Mobile Portals & Field Apps',
        'Real-time Customer Applications & Push Notification Hubs'
      ]
    },
    ai: {
      title: 'AI Agent Development',
      badge: 'Intelligent Autonomous Agents & AI Systems',
      desc: 'Transform your business operations with autonomous AI agents that handle repetitive tasks, qualify leads, and provide 24/7 intelligent customer interactions trained on your company data.',
      deliverables: [
        'Autonomous AI Customer Support Agents',
        'Website AI Assistants & Chatbots',
        'Enterprise Business AI Agents & Copilots',
        'Workflow Automation & Robotic Process Automation (RPA)',
        'Knowledge-Base RAG AI Systems',
        'Automated Lead Qualification & Sales Agents'
      ]
    },
    custom: {
      title: 'Custom Software Development',
      badge: 'Tailored Enterprise Systems',
      desc: 'Off-the-shelf software often forces you into rigid workflows. We engineer tailor-made software architectures designed specifically around your unique business logic and operations.',
      deliverables: [
        'Custom Business Management Systems (ERP)',
        'Customer Relationship Management (CRM) Systems',
        'Internal Team Portals & Productivity Tools',
        'Real-time Analytics & Executive Dashboards',
        'Business Process Automation Platforms',
        'Enterprise-Grade Cloud Infrastructure & APIs'
      ]
    },
    uiux: {
      title: 'UI/UX Design',
      badge: 'Human-Centered Design Systems',
      desc: 'Design is not just how it looks; it is how it works. We create intuitive user interfaces, comprehensive design systems, and delightful digital experiences that drive engagement and conversions.',
      deliverables: [
        'Modern Website UI/UX Design',
        'Mobile Application Interfaces',
        'Complex Dashboard & Analytics Design',
        'Interactive Wireframing & Clickable Prototyping',
        'Scalable Design Systems & Component Libraries',
        'UX Audits & Usability Optimization'
      ]
    },
    saas: {
      title: 'SaaS Product Development',
      badge: 'Scalable Cloud-Native Products',
      desc: 'From initial Minimum Viable Product (MVP) to multi-tenant cloud SaaS platforms serving thousands of concurrent users, we turn digital product concepts into market-ready businesses.',
      deliverables: [
        'Full-Cycle SaaS Platform Engineering',
        'Subscription & Billing Management (Stripe, Razorpay, LemonSqueezy)',
        'Multi-Tenant & Role-Based Access Architecture',
        'Cloud-Native Scalable Backend Infrastructure',
        'Product MVP Development for Startups & Scaleups',
        'Continuous Deployment & Monitoring Pipelines'
      ]
    }
  };

  function openServiceModal(serviceKey) {
    const data = serviceData[serviceKey];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalContent.innerHTML = `
      <div style="display:inline-block; padding: 4px 12px; background: rgba(0,163,255,0.1); border: 1px solid rgba(0,163,255,0.3); border-radius: 9999px; color: #00A3FF; font-size: 0.8125rem; font-weight: 700; margin-bottom: 16px;">
        ${data.badge}
      </div>
      <p style="margin-bottom: 24px; color: #CBD5E1; font-size: 1rem; line-height: 1.7;">
        ${data.desc}
      </p>
      <h4 style="font-size: 1.1rem; font-weight: 700; color: #FFFFFF; margin-bottom: 14px;">Key Capabilities & Scope:</h4>
      <ul style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 28px;">
        ${data.deliverables.map(item => `
          <li style="display: flex; align-items: center; gap: 10px; color: #94A3B8; font-size: 0.9375rem;">
            <span style="color: #00A3FF; font-weight: bold;">✔</span> ${item}
          </li>
        `).join('')}
      </ul>
      <div style="padding-top: 20px; border-top: 1px solid rgba(148, 163, 184, 0.15); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <span style="font-size: 0.875rem; color: #94A3B8;">Ready to build your ${data.title.toLowerCase()} solution?</span>
        <a href="#contact" class="btn btn-primary" onclick="document.getElementById('serviceModal').classList.remove('open')">
          Discuss This Project &rarr;
        </a>
      </div>
    `;

    serviceModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeServiceModal() {
    serviceModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bind service modal buttons and entire service cards for effortless interaction
  document.querySelectorAll('[data-service-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const serviceKey = btn.getAttribute('data-service-modal');
      openServiceModal(serviceKey);
    });
  });

  document.querySelectorAll('.service-card').forEach(card => {
    const btn = card.querySelector('[data-service-modal]');
    if (btn) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-haspopup', 'dialog');
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        const key = btn.getAttribute('data-service-modal');
        openServiceModal(key);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('button, a')) return;
          e.preventDefault();
          const key = btn.getAttribute('data-service-modal');
          openServiceModal(key);
        }
      });
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeServiceModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeServiceModal();
      }
    });
  }

  // 6. Legal Modals (Privacy & Terms)
  const legalModal = document.getElementById('legalModal');
  const legalModalTitle = document.getElementById('legalModalTitle');
  const legalModalBody = document.getElementById('legalModalBody');
  const legalModalClose = document.getElementById('legalModalClose');

  const legalContent = {
    privacy: {
      title: 'Privacy Policy',
      body: `
        <p style="margin-bottom: 16px;"><strong>Last Updated: October 2026</strong></p>
        <p style="margin-bottom: 16px;">At Sefron Technologies, we take your privacy and data security with utmost seriousness. This policy describes how we handle information submitted through our official website and project channels.</p>
        <h4 style="color:#FFF; margin: 16px 0 8px;">1. Information We Collect</h4>
        <p style="margin-bottom: 16px;">When you submit an inquiry via our contact form, we collect your name, phone number, email address, and project requirements to facilitate communication and provide technology consultation.</p>
        <h4 style="color:#FFF; margin: 16px 0 8px;">2. How We Use Information</h4>
        <p style="margin-bottom: 16px;">We use your contact details solely to discuss project scope, respond to inquiries, and provide technology proposals. We do not sell, rent, or distribute your private information to third-party advertisers.</p>
        <h4 style="color:#FFF; margin: 16px 0 8px;">3. Data Storage & Security</h4>
        <p style="margin-bottom: 16px;">Inquiries are processed through secured server endpoints and stored in encrypted formats. We implement enterprise-grade security practices to safeguard all client communication.</p>
      `
    },
    terms: {
      title: 'Terms & Conditions',
      body: `
        <p style="margin-bottom: 16px;"><strong>Last Updated: October 2026</strong></p>
        <p style="margin-bottom: 16px;">Welcome to Sefron Technologies. By accessing our website or engaging our technology services, you agree to comply with our professional terms.</p>
        <h4 style="color:#FFF; margin: 16px 0 8px;">1. Intellectual Property</h4>
        <p style="margin-bottom: 16px;">All brand assets, software architecture designs, codebases, and website contents are the proprietary intellectual property of Sefron Technologies unless otherwise stated under client master services agreements.</p>
        <h4 style="color:#FFF; margin: 16px 0 8px;">2. Service Agreements</h4>
        <p style="margin-bottom: 16px;">All commercial development projects (Web, Mobile, AI Agents, Custom Software, SaaS) are executed under explicit Statements of Work (SOW) defining milestones, deliverables, and warranties.</p>
      `
    }
  };

  document.querySelectorAll('[data-legal-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const type = link.getAttribute('data-legal-modal');
      const data = legalContent[type];
      if (data && legalModal) {
        legalModalTitle.textContent = data.title;
        legalModalBody.innerHTML = data.body;
        legalModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (legalModalClose) {
    legalModalClose.addEventListener('click', () => {
      legalModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) {
        legalModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Escape key closes open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (serviceModal && serviceModal.classList.contains('open')) closeServiceModal();
      if (legalModal && legalModal.classList.contains('open')) {
        legalModal.classList.remove('open');
        document.body.style.overflow = '';
      }
      if (mobileDrawer && mobileDrawer.classList.contains('open')) toggleMobileMenu(false);
    }
  });
});
