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

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Create mailto link with form data
    const subject = `ClanFit Inquiry - ${data.service}`;
    const body = `Name: ${data.name}%0D%0APhone: ${data.phone}%0D%0AEmail: ${data.email}%0D%0AService: ${data.service}%0D%0A%0D%0AMessage:%0D%0A${data.message}`;
    
    window.location.href = `mailto:clanfitpt@gmail.com?subject=${subject}&body=${body}`;
    
    // Show success message
    formMessage.className = 'form-message success';
    formMessage.textContent = 'Thank you! Your message has been prepared. Please send the email from your email client.';
    
    // Reset form
    contactForm.reset();
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
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
