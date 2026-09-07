import './style.css'
import Lenis from 'lenis'

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Acessibilidade e Reduce Motion ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 2. Smooth Scrolling (Lenis) ---
    let lenis;
    if (!prefersReducedMotion) {
        lenis = new Lenis({
            autoRaf: true,
            lerp: 0.1, // Smoothness
            wheelMultiplier: 1,
        });
    }

    // --- 2b. Smooth anchor navigation ---
    // Intercept every in-page # link and route through Lenis (or native smooth scroll).
    // The nav bar is ~64px tall; we offset by -80px to give the section a comfortable top margin.
    const NAV_OFFSET = -80;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const hash = anchor.getAttribute('href');
            if (hash === '#') return; // Skip bare # links

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();

            if (lenis) {
                lenis.scrollTo(target, { offset: NAV_OFFSET, duration: 1.2 });
            } else {
                // Fallback: native smooth scroll with manual offset
                const top = target.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- 3. Reactive Header ---
    const nav = document.getElementById('main-nav');
    let lastScrollY = window.scrollY;
    
    const handleScroll = (currentScrollY) => {
        // Background logic
        if (currentScrollY > 50) {
            nav.classList.add('bg-deep-navy/95', 'backdrop-blur', 'shadow-md');
            nav.classList.remove('bg-transparent');
        } else {
            nav.classList.remove('bg-deep-navy/95', 'backdrop-blur', 'shadow-md');
            nav.classList.add('bg-transparent');
        }
        
        // Hide/Show logic
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            nav.classList.add('header-hide');
        } else {
            nav.classList.remove('header-hide');
        }
        lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });

    // --- 4. Parallax Effects ---
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    if (!prefersReducedMotion && parallaxElements.length > 0) {
        const handleParallax = () => {
            const windowHeight = window.innerHeight;
            parallaxElements.forEach(el => {
                const rect = el.parentElement.getBoundingClientRect(); // Use parent container for rect
                
                // Only animate if in viewport
                if (rect.top <= windowHeight && rect.bottom >= 0) {
                    const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
                    // Calculate distance from center of viewport
                    const elementCenter = rect.top + (rect.height / 2);
                    const viewportCenter = windowHeight / 2;
                    const diff = elementCenter - viewportCenter;
                    
                    // Limit the parallax movement to prevent the image from escaping the container
                    // Scale 1.15 gives us about 7.5% margin on top and bottom
                    const yPos = diff * speed * 0.15; 
                    el.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.15)`;
                }
            });
        };
        // Listen to Lenis scroll for smoother parallax, fallback to native if Lenis is disabled
        if (lenis) {
            lenis.on('scroll', handleParallax);
        } else {
            window.addEventListener('scroll', handleParallax, { passive: true });
        }
    }

    // --- 5. Entrance Reveals ---
    const revealElements = document.querySelectorAll('.reveal-up');
    if (revealElements.length > 0) {
        if (prefersReducedMotion) {
            // If reduced motion, show immediately
            revealElements.forEach(el => el.classList.add('is-visible'));
        } else {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            });
            
            revealElements.forEach(el => revealObserver.observe(el));
            
            // Make sure hero elements are revealed immediately if they are at the top
            setTimeout(() => {
                document.querySelectorAll('header .reveal-up').forEach(el => el.classList.add('is-visible'));
            }, 100);
        }
    }

    // --- 6. Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
    const mobileMenuLinks = mobileMenu?.querySelectorAll('a, button') || [];
    
    if (mobileMenuBtn && mobileMenu) {
        const toggleMenu = (open) => {
            const isExpanded = open !== undefined ? open : mobileMenuBtn.getAttribute('aria-expanded') === 'false';
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
            
            if (isExpanded) {
                mobileMenu.classList.remove('translate-x-full');
                mobileMenu.classList.add('translate-x-0');
                if (lenis) lenis.stop();
                document.body.style.overflow = 'hidden';
                // Focus trap - focus on close button
                setTimeout(() => mobileMenuCloseBtn?.focus(), 300);
            } else {
                mobileMenu.classList.add('translate-x-full');
                mobileMenu.classList.remove('translate-x-0');
                if (lenis) lenis.start();
                document.body.style.overflow = '';
                mobileMenuBtn.focus();
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleMenu());
        mobileMenuCloseBtn?.addEventListener('click', () => toggleMenu(false));
        
        // Close menu when clicking links
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
                toggleMenu(false);
            }
        });
    }

    // --- 7. Active Nav Link (IntersectionObserver) ---
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    if (navLinks.length > 0) {
        const sectionIds = Array.from(navLinks).map(l => l.dataset.section);
        const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

        // Track which sections are currently intersecting
        const visibleSections = new Set();

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleSections.add(entry.target.id);
                } else {
                    visibleSections.delete(entry.target.id);
                }
            });

            // Find the topmost visible section (first in DOM order)
            let activeId = null;
            for (const id of sectionIds) {
                if (visibleSections.has(id)) {
                    activeId = id;
                    break;
                }
            }

            navLinks.forEach(link => {
                if (link.dataset.section === activeId) {
                    link.classList.add('is-active');
                } else {
                    link.classList.remove('is-active');
                }
            });
        }, {
            root: null,
            // Trigger when section occupies the middle 40% of the viewport
            rootMargin: '-30% 0px -30% 0px',
            threshold: 0,
        });

        sections.forEach(section => sectionObserver.observe(section));
    }
});
