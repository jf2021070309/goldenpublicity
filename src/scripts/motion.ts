// src/scripts/motion.ts - Awwwards Motion & Scroll Engine
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAwwwardsMotion() {
  // 1. Lenis Smooth Inertia Scroll (Fast & fluid 60fps/120fps)
  const lenis = new Lenis({
    duration: 0.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1.1
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(500, 33);

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -60, duration: 0.95 });
        }
      }
    });
  });

  // 2. Reading progress bar linked to Lenis scroll
  const progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    lenis.on('scroll', ({ progress }: { progress: number }) => {
      progressBar.style.width = `${progress * 100}%`;
    });
  }

  // 3. Interactive Magnetic Follower Cursor (Desktop with fine pointer only)
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');
  const followerText = document.getElementById('cursor-text');

  if (hasFinePointer && dot && follower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let isMoving = false;

    const renderCursor = () => {
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;
      followerX += dx * 0.22;
      followerY += dy * 0.22;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        requestAnimationFrame(renderCursor);
      } else {
        isMoving = false;
      }
    };

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    // Magnetic buttons
    const magneticBtns = document.querySelectorAll(
      '.btn-golden-primary, .btn-golden-secondary, .btn-golden-whatsapp, .quote-btn, .filter-chip, .gallery-chip, .slider-arrow'
    );
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        follower.classList.add('cursor-magnetic');
      });
      btn.addEventListener('mouseleave', () => {
        follower.classList.remove('cursor-magnetic');
        (btn as HTMLElement).style.transform = '';
      });
      btn.addEventListener('mousemove', (e: any) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        (btn as HTMLElement).style.transform = `translate3d(${relX * 0.22}px, ${relY * 0.22}px, 0)`;
      }, { passive: true });
    });

    // View text on project & talent cards
    const interactiveCards = document.querySelectorAll('.talent-card, .exp-card, .bento-featured-card');
    interactiveCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        follower.classList.add('cursor-card-view');
        if (followerText) followerText.textContent = 'VER';
      });
      card.addEventListener('mouseleave', () => {
        follower.classList.remove('cursor-card-view');
        if (followerText) followerText.textContent = '';
      });
    });
  }

  // 4. Smooth 3D Card Tilt with RAF throttle
  if (hasFinePointer) {
    const tiltCards = document.querySelectorAll('.talent-card, .exp-card');
    tiltCards.forEach((cardEl) => {
      const card = cardEl as HTMLElement;
      let tiltTicking = false;

      card.addEventListener('mousemove', (e) => {
        if (!tiltTicking) {
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) translateY(-5px)`;
            tiltTicking = false;
          });
          tiltTicking = true;
        }
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) translateY(0)';
      });
    });
  }

  // 5. Faulhaber Kinetic Typography Horizontal Scrub (Marquee velocity)
  const marqueeTrack1 = document.querySelector('.kinetic-track-left') as HTMLElement;
  const marqueeTrack2 = document.querySelector('.kinetic-track-right') as HTMLElement;

  if (marqueeTrack1 || marqueeTrack2) {
    lenis.on('scroll', ({ velocity }: { velocity: number }) => {
      const boost = velocity * 0.6;
      if (marqueeTrack1) {
        marqueeTrack1.style.setProperty('--velocity-boost', `${boost}px`);
      }
      if (marqueeTrack2) {
        marqueeTrack2.style.setProperty('--velocity-boost', `${-boost}px`);
      }
    });

    if (marqueeTrack1) {
      gsap.to(marqueeTrack1, {
        xPercent: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: '.kinetic-ticker-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    if (marqueeTrack2) {
      gsap.to(marqueeTrack2, {
        xPercent: 35,
        ease: 'none',
        scrollTrigger: {
          trigger: '.kinetic-ticker-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }
  }

  // 6. Zorro Multi-Layer Parallax Elements
  const parallaxNodes = document.querySelectorAll('[data-parallax-speed]');
  parallaxNodes.forEach((node) => {
    const el = node as HTMLElement;
    const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.15');
    gsap.to(el, {
      y: () => speed * 180,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // 7. Rotating Agency Badge (Zorro / Godly Stamp)
  const rotatingBadge = document.querySelector('.spinning-agency-stamp') as HTMLElement;
  if (rotatingBadge) {
    lenis.on('scroll', ({ velocity }: { velocity: number }) => {
      const extraRotation = velocity * 1.5;
      gsap.to(rotatingBadge, {
        rotate: `+=${extraRotation}`,
        duration: 0.4,
        ease: 'power1.out'
      });
    });
  }

  // 8. Progressive Agency Entrance Animations (Lenis + GSAP ScrollTrigger)
  // Elements remain 100% opaque by default in CSS. When entering the viewport,
  // we trigger smooth entrance transforms that clear props on finish, avoiding any washed-out appearance.
  gsap.utils.toArray<HTMLElement>('.reveal-stagger').forEach((container) => {
    const children = Array.from(container.children) as HTMLElement[];
    if (!children.length) return;
    
    ScrollTrigger.create({
      trigger: container,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.from(children, {
          y: 24,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    });
  });

  // Section headers and prominent containers
  gsap.utils.toArray<HTMLElement>('.reveal-scroll').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.from(el, {
          y: 28,
          duration: 0.75,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    });
  });

  // Lateral entrance - Left
  gsap.utils.toArray<HTMLElement>('.reveal-left').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.from(el, {
          x: -30,
          duration: 0.75,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    });
  });

  // Lateral entrance - Right
  gsap.utils.toArray<HTMLElement>('.reveal-right').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.from(el, {
          x: 30,
          duration: 0.75,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    });
  });

  // Scale entrance
  gsap.utils.toArray<HTMLElement>('.reveal-scale').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.from(el, {
          scale: 0.96,
          duration: 0.75,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    });
  });

  // 9. Animated Metric Counters with GSAP Scrub
  const counterElements = document.querySelectorAll<HTMLElement>('[data-count]');
  counterElements.forEach((el) => {
    const targetVal = parseInt(el.getAttribute('data-count') || '0', 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${Math.floor(obj.val)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = `${prefix}${targetVal}${suffix}`;
          }
        });
      }
    });
  });

  // Synchronize and refresh trigger coordinates once images & fonts finish loading
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 450);
}
