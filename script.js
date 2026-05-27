/**
 * HARINISRI R. Portfolio - Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SLEEK PRELOADER ANIMATION
    // ==========================================================================
    const loaderContainer = document.getElementById('loader-container');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPercentage = document.getElementById('loader-percentage');
    
    let progress = 0;
    const intervalTime = 15; // ms
    const totalDuration = 1000; // 1 second loading transition simulation
    const increment = 100 / (totalDuration / intervalTime);

    const simulateLoading = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(simulateLoading);
            
            // Fade out preloader
            setTimeout(() => {
                loaderContainer.classList.add('loaded');
                // Trigger page reveals right after loading
                triggerInitialReveals();
            }, 300);
        }
        loaderBar.style.width = `${progress}%`;
        loaderPercentage.textContent = `${Math.round(progress)}%`;
    }, intervalTime);


    // ==========================================================================
    // 2. CUSTOM DYNAMIC CURSOR
    // ==========================================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Lerping factor for smooth outline tracking
    const speed = 0.15;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate position for the central dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Custom animation loop to interpolate the outer ring cursor position
    function animateCursor() {
        // Calculate difference
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        // Add fraction of difference (smooth tracking)
        cursorX += dx * speed;
        cursorY += dy * speed;
        
        cursorOutline.style.left = `${cursorX}px`;
        cursorOutline.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states for cursor
    const hoverElements = document.querySelectorAll('a, button, .btn, .glass-card, .hamburger, .social-hero-icon, input, textarea');
    hoverElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        elem.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });


    // ==========================================================================
    // 3. HTML5 CANVAS CONNECTED PARTICLE WEB (ECE Theme)
    // ==========================================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 65; // Balanced density
    
    // Resize handler
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse tracking object for canvas physics
    const canvasMouse = {
        x: null,
        y: null,
        radius: 130 // Interaction radius
    };

    window.addEventListener('mousemove', (e) => {
        canvasMouse.x = e.clientX;
        canvasMouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        canvasMouse.x = null;
        canvasMouse.y = null;
    });

    // Particle Blueprint class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Movement velocities
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.size = Math.random() * 2 + 1; // 1px to 3px
        }

        update() {
            // Bounce off left/right edges
            if (this.x < 0 || this.x > canvas.width) {
                this.vx = -this.vx;
            }
            // Bounce off top/bottom edges
            if (this.y < 0 || this.y > canvas.height) {
                this.vy = -this.vy;
            }

            // Move particle
            this.x += this.vx;
            this.y += this.vy;

            // Interactive attraction to cursor
            if (canvasMouse.x !== null && canvasMouse.y !== null) {
                let dx = canvasMouse.x - this.x;
                let dy = canvasMouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < canvasMouse.radius) {
                    // Pull particle slightly toward cursor
                    const force = (canvasMouse.radius - distance) / canvasMouse.radius;
                    this.x += (dx / distance) * force * 1.5;
                    this.y += (dy / distance) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Populate particles arrays
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    // Render logic loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Draw connection networks between close particles (Node-mesh effect)
    function connectParticles() {
        let opacityValue = 1;
        const maxDist = 115;
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    // Connect lines fade out the farther apart they are
                    opacityValue = 1 - (dist / maxDist);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue * 0.18})`; // Cyan/Purple blended line tint
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }


    // ==========================================================================
    // 4. STICKY NAVBAR & NAVIGATION SCROLL EFFECTS
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        // Sticky Header shrink
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Top horizontal scroll indicator updates
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (docHeight > 0) {
            const scrollPercent = (scrollY / docHeight) * 100;
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // Active link highlight based on viewport section positions
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset navbar height plus buffers
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    // ==========================================================================
    // 5. RESPONSIVE MOBILE NAVIGATION MENU
    // ==========================================================================
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu immediately upon link selection
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });


    // ==========================================================================
    // 6. ROLE TYPING WRITER ENGINE
    // ==========================================================================
    const typingText = document.getElementById('typing-text');
    const roles = [
        "Electronics & Communication Engineering Student",
        "Frontend Developer",
        "Web Designer"
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function typeWriterEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            // Delete character
            typingText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 45; // Backspace faster
        } else {
            // Type character
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 95; // Default typing pace
        }

        // Handle word completions
        if (!isDeleting && charIndex === currentRole.length) {
            typeDelay = 2200; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length; // Rotate index cycle
            typeDelay = 400; // Brief delay before typing next word
        }

        setTimeout(typeWriterEffect, typeDelay);
    }
    
    // Start typing after a short initial buffer
    setTimeout(typeWriterEffect, 1200);


    // ==========================================================================
    // 7. INTERACTIVE MOUSE-FOLLOW GLOW CARDS
    // ==========================================================================
    const glowCards = document.querySelectorAll('.hover-glow-card');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse coordinates relative to the card border
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables dynamically in CSS
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    // ==========================================================================
    // 8. SCROLL REVEAL VIEWPORT INTERSECTION OBSERVER
    // ==========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const skillProgressBars = document.querySelectorAll('.skill-progress-bar');
    
    // Config option thresholds
    const revealOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check if card has a delays parameter
                const delay = entry.target.getAttribute('data-delay');
                if (delay) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, delay);
                } else {
                    entry.target.classList.add('active');
                }
                
                // Specific action: If the skills column is revealed, animate its progress bars
                if (entry.target.classList.contains('skills-column')) {
                    animateSkillsBars();
                }
                
                // Stop observing element once animated
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Helper: Trigger animations on page-load immediately for top hero section elements
    function triggerInitialReveals() {
        const heroElements = document.querySelectorAll('.hero-section .scroll-reveal');
        heroElements.forEach(el => {
            el.classList.add('active');
        });
    }

    // Helper: Animate skills bars to their actual configured percentage values
    function animateSkillsBars() {
        skillProgressBars.forEach(bar => {
            const percentage = bar.getAttribute('data-progress');
            bar.style.width = percentage;
        });
    }


    // ==========================================================================
    // 9. MODERN CONTACT FORM UI LOGIC (Frontend Mockup)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Visual submit state loader
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            
            // Simulating API POST request latency
            setTimeout(() => {
                // Success message
                formStatus.className = 'form-status success';
                formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully.`;
                
                // Reset form fields
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                // Remove status report after a couple seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                    formStatus.className = 'form-status';
                }, 4000);
            }, 1500);
        });
    }


    // ==========================================================================
    // 9.5 COPY EMAIL TO CLIPBOARD
    // ==========================================================================
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailCard = document.getElementById('email-card');

    if (copyEmailBtn && emailCard) {
        copyEmailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyEmailToClipboard();
        });

        emailCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('email-link')) {
                return;
            }
            e.preventDefault();
            copyEmailToClipboard();
        });
    }

    function copyEmailToClipboard() {
        const emailLink = document.querySelector('.email-link');
        if (!emailLink) return;
        
        let emailText = emailLink.textContent || emailLink.innerText;
        
        navigator.clipboard.writeText(emailText).then(() => {
            const icon = copyEmailBtn.querySelector('i');
            const originalIconClass = icon.className;
            icon.className = 'fa-solid fa-check';
            copyEmailBtn.classList.add('copied');
            copyEmailBtn.setAttribute('title', 'Copied!');
            
            setTimeout(() => {
                icon.className = originalIconClass;
                copyEmailBtn.classList.remove('copied');
                copyEmailBtn.setAttribute('title', 'Copy to clipboard');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }


    // ==========================================================================
    // 10. BACK TO TOP SCROLL BUTTON
    // ==========================================================================
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 550) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

});
