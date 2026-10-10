/**
 * SEFRON TECHNOLOGIES - Interactive Hero Tech Matrix
 * High-performance lightweight Canvas visualizer representing AI Agents, Cloud Nodes, and Architecture.
 * Tuned for Light Grey & Light Blue Theme.
 */

(function initHeroVisual() {
  const canvas = document.getElementById('heroTechCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  function resizeCanvas() {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : 0;
    const h = parent ? parent.clientHeight : 0;
    width = canvas.width = w > 0 ? w : (canvas.clientWidth || 420);
    height = canvas.height = h > 0 ? h : (canvas.clientHeight || 340);
    createParticles();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2.2 + 1.6;
      this.isNode = Math.random() > 0.80; // 20% are highlighted architecture nodes
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.04;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      const currentRadius = this.isNode 
        ? this.radius + Math.sin(this.pulse) * 0.9 
        : this.radius;

      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);

      if (this.isNode) {
        ctx.fillStyle = '#0077CC';
        ctx.shadowColor = '#00A3FF';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((width * height) / 8000);
    const particleCount = Math.max(25, Math.min(count, 55));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          if (particles[i].isNode || particles[j].isNode) {
            ctx.strokeStyle = `rgba(0, 119, 204, ${alpha * 1.4})`;
            ctx.lineWidth = 1.3;
          } else {
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.9})`;
            ctx.lineWidth = 0.9;
          }
          ctx.stroke();
        }
      }
    }
  }

  function drawCentralHub() {
    const cx = width / 2;
    const cy = height / 2;
    const time = Date.now() * 0.001;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer Orbit 1
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 119, 204, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();

    // Outer Orbit 2
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 12]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Accent Arcs
    ctx.beginPath();
    ctx.arc(0, 0, 80, time, time + Math.PI * 0.4);
    ctx.strokeStyle = '#0077CC';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 120, -time * 0.8, -time * 0.8 + Math.PI * 0.3);
    ctx.strokeStyle = '#00A3FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Core Glow
    const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 35);
    gradient.addColorStop(0, 'rgba(0, 163, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(0, 119, 204, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 119, 204, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();

    // Inner Core
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0077CC';
    ctx.shadowColor = '#00A3FF';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawCentralHub();

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();

    animationFrameId = requestAnimationFrame(animate);
  }

  // Mouse Listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('load', resizeCanvas, { passive: true });
  document.addEventListener('DOMContentLoaded', resizeCanvas, { passive: true });
  setTimeout(resizeCanvas, 60);
  setTimeout(resizeCanvas, 300);

  let isVisible = true;
  function startAnimation() {
    if (!animationFrameId && isVisible) {
      animate();
    }
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  resizeCanvas();
  startAnimation();
})();

