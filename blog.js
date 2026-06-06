// ============================================
// ClanFit Blog - JavaScript
// Fetches posts from Blogger JSON API
// ============================================

/* ---- Navbar ---- */
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

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ============================================
   BLOGGER JSON API CONFIG
============================================ */
const BLOG_ID = '2425771755352888399'; // ClanFit Blogger ID
const BLOGGER_FEED_URL = `https://clanfitpt.blogspot.com/feeds/posts/default?alt=json&max-results=50`;

/* ---- State ---- */
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const POSTS_PER_PAGE = 6;
let currentCategory = 'all';
let searchQuery = '';

/* ============================================
   FETCH & RENDER POSTS
============================================ */
async function fetchAllPosts() {
    const grid = document.getElementById('blogPostsGrid');
    const countEl = document.getElementById('blogPostsCount');

    try {
        const response = await fetch(BLOGGER_FEED_URL);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const entries = data.feed.entry || [];

        allPosts = entries.map(parseEntry);
        filteredPosts = [...allPosts];

        countEl.textContent = `${allPosts.length} post${allPosts.length !== 1 ? 's' : ''} found`;
        renderPosts();
        renderFeaturedPosts();

    } catch (err) {
        console.warn('Blogger API fetch failed, using demo posts:', err);
        allPosts = getDemoPosts();
        filteredPosts = [...allPosts];
        countEl.textContent = `${allPosts.length} posts found`;
        renderPosts();
        renderFeaturedPosts();
    }
}

function parseEntry(entry) {
    const title = entry.title.$t || 'Untitled Post';
    const link = entry.link?.find(l => l.rel === 'alternate')?.href || 'https://clanfitpt.blogspot.com';

    const rawContent = entry.content?.$t || entry.summary?.$t || '';
    const div = document.createElement('div');
    div.innerHTML = rawContent;
    const textContent = div.textContent || '';
    const excerpt = textContent.substring(0, 200).trim() + (textContent.length > 200 ? '...' : '');

    const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/);
    const thumbnail = entry.media$thumbnail?.url || (imgMatch ? imgMatch[1] : null);

    const published = new Date(entry.published.$t);

    const tags = entry.category?.map(c => c.term) || [];
    const category = detectCategory(tags, title);

    return { title, link, excerpt, thumbnail, published, tags, category, entry };
}

function detectCategory(tags, title) {
    const text = [...tags, title].join(' ').toLowerCase();
    if (text.match(/nutrition|diet|food|meal|protein|calor/)) return 'nutrition';
    if (text.match(/lifestyle|habit|sleep|stress|wellnes|mindset/)) return 'lifestyle';
    if (text.match(/strength|weight|lift|muscle|squat|bench|deadlift/)) return 'training';
    return 'fitness';
}

function renderPosts() {
    const grid = document.getElementById('blogPostsGrid');
    const countEl = document.getElementById('blogPostsCount');

    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const pagePosts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

    countEl.textContent = `${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''} found`;

    if (pagePosts.length === 0) {
        grid.innerHTML = `
            <div class="blog-no-posts">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try a different search term or category filter.</p>
            </div>
        `;
        document.getElementById('blogPagination').innerHTML = '';
        return;
    }

    const icons = { fitness: '🏋️', nutrition: '🥗', lifestyle: '🌿', training: '💪' };

    grid.innerHTML = pagePosts.map((post, i) => {
        const dateStr = post.published.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const icon = icons[post.category] || '⚡';
        const categoryLabel = post.category.charAt(0).toUpperCase() + post.category.slice(1);

        return `
            <a href="${post.link}" target="_blank" rel="noopener noreferrer"
               class="blog-post-card reveal" style="animation-delay: ${i * 0.1}s">
                ${post.thumbnail
                    ? `<img class="blog-post-thumb" src="${post.thumbnail}" alt="${post.title}" loading="lazy"
                          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="blog-post-thumb-placeholder" style="display:none">${icon}</div>`
                    : `<div class="blog-post-thumb-placeholder">${icon}</div>`
                }
                <div class="blog-post-body">
                    <div class="blog-post-meta">
                        <span class="blog-post-category">${categoryLabel}</span>
                        <span class="blog-post-date">
                            <i class="fas fa-calendar-alt"></i> ${dateStr}
                        </span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="blog-post-footer">
                        <span class="blog-read-more-btn">
                            Read Full Article <i class="fas fa-arrow-right"></i>
                        </span>
                        <div class="blog-post-author">
                            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=50" alt="Sridhar">
                            <span>by Sridhar</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    renderPagination();
    revealBlogElements();
}

function renderPagination() {
    const pagination = document.getElementById('blogPagination');
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }

    // Pages
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 2) {
            html += `<span style="color:var(--text-muted);padding:8px 4px;">...</span>`;
        }
    }

    // Next
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }

    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderPosts();
    document.getElementById('blog-top').scrollIntoView({ behavior: 'smooth' });
}

function renderFeaturedPosts() {
    const container = document.getElementById('featuredPosts');
    const featured = allPosts.slice(0, 4);
    const icons = { fitness: '🏋️', nutrition: '🥗', lifestyle: '🌿', training: '💪' };

    container.innerHTML = featured.map(post => {
        const dateStr = post.published.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short'
        });
        const icon = icons[post.category] || '⚡';

        return `
            <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="sidebar-post">
                ${post.thumbnail
                    ? `<img class="sidebar-post-thumb" src="${post.thumbnail}" alt="${post.title}" loading="lazy"
                          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="sidebar-post-placeholder" style="display:none">${icon}</div>`
                    : `<div class="sidebar-post-placeholder">${icon}</div>`
                }
                <div>
                    <h4>${post.title.length > 65 ? post.title.substring(0, 65) + '...' : post.title}</h4>
                    <span class="sidebar-post-date"><i class="fas fa-calendar"></i> ${dateStr}</span>
                </div>
            </a>
        `;
    }).join('');
}

/* ============================================
   DEMO POSTS (fallback if API fails)
============================================ */
function getDemoPosts() {
    return [
        {
            title: '5 Morning Workout Habits to Kickstart Your Fitness Journey',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'Starting your day with the right fitness habits can transform your energy levels, mental clarity, and long-term results. Sridhar shares the 5 morning rituals he recommends to every client who wants to see real, lasting change.',
            thumbnail: null,
            published: new Date('2026-06-01'),
            category: 'fitness',
            tags: ['fitness', 'morning routine']
        },
        {
            title: 'Nutrition Tips for Building Lean Muscle Efficiently',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'Building lean muscle isn\'t just about lifting heavy — nutrition plays an equally critical role. In this guide, Sridhar breaks down exactly how to eat to maximize muscle protein synthesis without unnecessary fat gain.',
            thumbnail: null,
            published: new Date('2026-06-05'),
            category: 'nutrition',
            tags: ['nutrition', 'muscle', 'protein']
        },
        {
            title: 'How Personal Training Accelerates Your Results by 3x',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'Studies consistently show that people who train with a certified personal trainer achieve results significantly faster than those who go it alone. Here\'s why ClanFit\'s personalized approach makes all the difference.',
            thumbnail: null,
            published: new Date('2026-06-08'),
            category: 'training',
            tags: ['training', 'personal trainer']
        },
        {
            title: 'Rest & Recovery: The Secret Weapon of Elite Athletes',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'Most people focus entirely on how hard they train, ignoring the single most important factor in athletic performance: recovery. Learn why rest is not laziness — it\'s where your body actually gets stronger.',
            thumbnail: null,
            published: new Date('2026-06-10'),
            category: 'lifestyle',
            tags: ['recovery', 'sleep', 'lifestyle']
        },
        {
            title: 'Beginner\'s Guide to Strength Training with Sridhar',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'If you\'ve never touched a barbell or set foot in a gym, this guide is for you. ClanFit\'s Sridhar walks you through the 7 fundamental strength training principles every beginner needs to know before they start.',
            thumbnail: null,
            published: new Date('2026-06-12'),
            category: 'training',
            tags: ['strength', 'beginner', 'training']
        },
        {
            title: 'The ClanFit Approach to Sustainable Weight Loss',
            link: 'https://clanfitpt.blogspot.com',
            excerpt: 'Crash diets and extreme exercise programs don\'t work long-term. ClanFit\'s philosophy is built on sustainable, science-backed strategies that help you lose fat while keeping your muscle — and your sanity.',
            thumbnail: null,
            published: new Date('2026-06-15'),
            category: 'fitness',
            tags: ['weight loss', 'fitness', 'diet']
        }
    ];
}

/* ============================================
   FILTER & SEARCH
============================================ */
function applyFilters() {
    filteredPosts = allPosts.filter(post => {
        const matchesCategory = currentCategory === 'all' || post.category === currentCategory;
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery) ||
            post.excerpt.toLowerCase().includes(searchQuery) ||
            post.tags.some(t => t.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });

    currentPage = 1;
    renderPosts();
}

/* Category buttons */
document.querySelectorAll('.blog-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.blog-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        applyFilters();
    });
});

/* Search input */
const searchInput = document.getElementById('blogSearch');
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value.toLowerCase().trim();
            applyFilters();
        }, 300);
    });
}

/* Sort */
const sortSelect = document.getElementById('blogSort');
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        if (sortSelect.value === 'oldest') {
            filteredPosts.sort((a, b) => a.published - b.published);
        } else {
            filteredPosts.sort((a, b) => b.published - a.published);
        }
        currentPage = 1;
        renderPosts();
    });
}

/* Tags */
document.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        searchQuery = pill.textContent.toLowerCase().trim();
        if (searchInput) searchInput.value = pill.textContent;
        applyFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

/* ============================================
   SCROLL REVEAL
============================================ */
function revealBlogElements() {
    document.querySelectorAll('.reveal').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
            setTimeout(() => el.classList.add('visible'), i * 80);
        }
    });
}

window.addEventListener('scroll', revealBlogElements);
window.addEventListener('load', () => {
    fetchAllPosts();
    revealBlogElements();
});
