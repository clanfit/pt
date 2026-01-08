// Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation on Scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Contact Form Handler with Web3Forms
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Prepare form data
    const formData = new FormData(contactForm);
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Success message
            formMessage.className = 'form-message success';
            formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. We will get back to you soon.';
            formMessage.style.display = 'block';
            
            // Reset form
            contactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } else {
            // Error message
            formMessage.className = 'form-message error';
            formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Oops! Something went wrong. Please try again or contact us directly.';
            formMessage.style.display = 'block';
        }
    } catch (error) {
        // Network error
        formMessage.className = 'form-message error';
        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error. Please check your connection and try again.';
        formMessage.style.display = 'block';
    } finally {
        // Reset button state
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
});


// Load Social Media Content from LocalStorage
function loadSocialContent() {
    const socialFeeds = JSON.parse(localStorage.getItem('socialFeeds') || '[]');
    const actingVideos = JSON.parse(localStorage.getItem('actingVideos') || '[]');
    
    const socialFeedsContainer = document.getElementById('socialFeedsContainer');
    const actingVideosContainer = document.getElementById('actingVideos');
    
    // Load social feeds
    if (socialFeeds.length > 0) {
        socialFeedsContainer.innerHTML = '';
        socialFeeds.forEach(feed => {
            const feedElement = document.createElement('div');
            feedElement.className = 'social-embed';
            feedElement.innerHTML = feed.embedCode;
            socialFeedsContainer.appendChild(feedElement);
        });
    }
    
    // Load acting videos
    if (actingVideos.length > 0) {
        actingVideosContainer.innerHTML = '';
        actingVideos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'social-embed';
            videoElement.innerHTML = video.embedCode;
            actingVideosContainer.appendChild(videoElement);
        });
    }
}

// Load content on page load
document.addEventListener('DOMContentLoaded', loadSocialContent);

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card, .gallery-item, .contact-card').forEach(el => {
    observer.observe(el);
});

/* Enhanced Form Messages */
.form-message {
    margin-top: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    display: none;
    font-weight: 500;
    animation: slideDown 0.3s ease;
}

.form-message i {
    margin-right: 0.5rem;
}

.form-message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    display: block;
}

.form-message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    display: block;
}

.btn-loader {
    display: none;
}

/* Hidden honeypot field */
.hidden {
    display: none !important;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

