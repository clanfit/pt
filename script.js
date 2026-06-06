// ============================================
// ClanFit - Main Site JavaScript
// ============================================

/* ---- Navigation ---- */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/* ---- Navbar scroll behaviour ---- */
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveNav();
    revealElements();
});

/* ---- Active nav link on scroll ---- */
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.slice(1) === current) {
            link.classList.add('active');
        }
    });
}

/* ---- Smooth scrolling ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ---- Scroll Reveal ---- */
function revealElements() {
    document.querySelectorAll('.reveal').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            setTimeout(() => el.classList.add('visible'), i * 80);
        }
    });
}

/* Run once on load */
window.addEventListener('load', () => {
    revealElements();
    loadBlogPosts();
    animateCounters();
});

/* ---- Animated Counters ---- */
function animateCounters() {
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 1500;
                const step = target / (duration / 16);
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.round(current);
                }, 16);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNums.forEach(el => observer.observe(el));
}

/* ---- Gallery Lightbox ---- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

/* ---- Contact Form Handler ---- */
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = '✅ Message sent! Sridhar will get back to you soon.';
                contactForm.reset();
            } else {
                throw new Error(data.message || 'Form submission failed');
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = '❌ Failed to send. Please try calling: 8050727935';
        } finally {
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

/* ---- Blog Posts from Blogger API ---- */
async function loadBlogPosts() {
    const blogGrid = document.getElementById('blogPreviewGrid');
    if (!blogGrid) return;

    const BLOGGER_FEED = 'https://clanfitpt.blogspot.com/feeds/posts/default?alt=json&max-results=3&callback=';

    try {
        const response = await fetch(
            `https://clanfitpt.blogspot.com/feeds/posts/default?alt=json&max-results=3`
        );
        const data = await response.json();
        const entries = data.feed.entry || [];

        if (entries.length === 0) {
            blogGrid.innerHTML = renderFallbackPosts();
            return;
        }

        blogGrid.innerHTML = entries.map(entry => renderBlogCard(entry)).join('');
        revealElements();

    } catch (err) {
        // Fallback: show static demo posts if CORS blocks the fetch
        blogGrid.innerHTML = renderFallbackPosts();
        revealElements();
    }
}

function renderBlogCard(entry) {
    const title = entry.title.$t || 'Fitness Tips';
    const link = entry.link.find(l => l.rel === 'alternate')?.href || 'blog.html';
    const published = new Date(entry.published.$t).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // Extract text excerpt
    let content = '';
    if (entry.content) {
        const div = document.createElement('div');
        div.innerHTML = entry.content.$t;
        content = div.textContent.substring(0, 130) + '...';
    } else if (entry.summary) {
        content = entry.summary.$t.substring(0, 130) + '...';
    }

    // Try to find image in content
    const imgMatch = entry.content?.$t?.match(/<img[^>]+src="([^">]+)"/);
    const imgSrc = imgMatch ? imgMatch[1] : null;

    const icons = ['🏋️', '🥗', '💪', '🏃', '🧘', '⚡'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    return `
        <a href="${link}" target="_blank" class="blog-card reveal" rel="noopener noreferrer">
            ${imgSrc
                ? `<img class="blog-card-img" src="${imgSrc}" alt="${title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : ''
            }
            <div class="blog-card-img-placeholder" style="${imgSrc ? 'display:none;' : ''}">
                ${randomIcon}
            </div>
            <div class="blog-card-body">
                <div class="blog-card-meta">
                    <span class="blog-card-category">Fitness</span>
                    <span><i class="fas fa-calendar"></i> ${published}</span>
                </div>
                <h3>${title}</h3>
                <p>${content}</p>
                <span class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></span>
            </div>
        </a>
    `;
}

function renderFallbackPosts() {
    const posts = [
        {
            title: '5 Morning Workout Habits to Kickstart Your Fitness Journey',
            date: '1 Jun 2026',
            excerpt: 'Starting your day with the right fitness habits can transform your energy levels, mental clarity, and long-term results. Here are 5 habits Sridhar swears by...',
            icon: '🌅',
            link: 'https://clanfitpt.blogspot.com'
        },
        {
            title: 'Nutrition Tips for Building Lean Muscle',
            date: '5 Jun 2026',
            excerpt: 'Building lean muscle isn\'t just about lifting heavy — nutrition plays an equally important role. Learn how to fuel your body for maximum muscle growth...',
            icon: '🥗',
            link: 'https://clanfitpt.blogspot.com'
        },
        {
            title: 'How Personal Training Accelerates Your Results',
            date: '8 Jun 2026',
            excerpt: 'Studies show that people who train with a certified personal trainer achieve results 3x faster than those who train alone. Here\'s why having Sridhar by your side makes all the difference...',
            icon: '💪',
            link: 'https://clanfitpt.blogspot.com'
        }
    ];

    return posts.map(post => `
        <a href="${post.link}" target="_blank" class="blog-card reveal" rel="noopener noreferrer">
            <div class="blog-card-img-placeholder">${post.icon}</div>
            <div class="blog-card-body">
                <div class="blog-card-meta">
                    <span class="blog-card-category">Fitness</span>
                    <span><i class="fas fa-calendar"></i> ${post.date}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <span class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></span>
            </div>
        </a>
    `).join('');
}

/* ---- Parallax Hero BG ---- */
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.3}px)`;
    }
});
