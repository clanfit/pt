// Admin credentials (In production, this should be handled server-side)
const ADMIN_USERNAME = 'sridhar';
const ADMIN_PASSWORD = 'clanfit2026';

// DOM Elements
const loginWrapper = document.getElementById('loginWrapper');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Form Elements
const socialForm = document.getElementById('socialForm');
const actingForm = document.getElementById('actingForm');
const socialPostsList = document.getElementById('socialPostsList');
const actingPostsList = document.getElementById('actingPostsList');

// Check if already logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
    showAdminPanel();
}

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.classList.add('show');
        setTimeout(() => {
            loginError.classList.remove('show');
        }, 3000);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    adminPanel.style.display = 'none';
    loginWrapper.style.display = 'flex';
    loginForm.reset();
});

function showAdminPanel() {
    loginWrapper.style.display = 'none';
    adminPanel.style.display = 'block';
    loadAllPosts();
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Social Media Form Handler
socialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const platform = document.getElementById('socialPlatform').value;
    const embedInput = document.getElementById('socialEmbed').value;
    const description = document.getElementById('socialDescription').value;
    
    const embedCode = convertToEmbed(platform, embedInput);
    
    if (!embedCode) {
        alert('Invalid URL or embed code. Please check and try again.');
        return;
    }
    
    const post = {
        id: Date.now(),
        platform: platform,
        embedCode: embedCode,
        description: description,
        date: new Date().toLocaleDateString()
    };
    
    // Save to localStorage
    const socialFeeds = JSON.parse(localStorage.getItem('socialFeeds') || '[]');
    socialFeeds.push(post);
    localStorage.setItem('socialFeeds', JSON.stringify(socialFeeds));
    
    showSuccessMessage(socialForm, 'Post added successfully!');
    socialForm.reset();
    loadAllPosts();
});

// Acting Form Handler
actingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const platform = document.getElementById('actingPlatform').value;
    const embedInput = document.getElementById('actingEmbed').value;
    const title = document.getElementById('actingTitle').value;
    
    const embedCode = convertToEmbed(platform, embedInput);
    
    if (!embedCode) {
        alert('Invalid URL or embed code. Please check and try again.');
        return;
    }
    
    const video = {
        id: Date.now(),
        platform: platform,
        embedCode: embedCode,
        title: title,
        date: new Date().toLocaleDateString()
    };
    
    // Save to localStorage
    const actingVideos = JSON.parse(localStorage.getItem('actingVideos') || '[]');
    actingVideos.push(video);
    localStorage.setItem('actingVideos', JSON.stringify(actingVideos));
    
    showSuccessMessage(actingForm, 'Video added successfully!');
    actingForm.reset();
    loadAllPosts();
});

// Convert URL to Embed Code
function convertToEmbed(platform, input) {
    let embedCode = '';
    
    if (platform === 'youtube') {
        // Extract YouTube video ID
        let videoId = '';
        if (input.includes('youtube.com/watch?v=')) {
            videoId = input.split('watch?v=')[1].split('&')[0];
        } else if (input.includes('youtu.be/')) {
            videoId = input.split('youtu.be/')[1].split('?')[0];
        } else if (input.includes('youtube.com/embed/')) {
            videoId = input.split('embed/')[1].split('?')[0];
        }
        
        if (videoId) {
            embedCode = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    } else if (platform === 'instagram') {
        // If it's already embed code
        if (input.includes('instagram.com/p/') && input.includes('blockquote')) {
            embedCode = input;
        } else {
            // If it's just a URL, create basic embed
            embedCode = `<blockquote class="instagram-media" data-instgrm-permalink="${input}" style="max-width:540px; min-width:326px; width:100%;"></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
        }
    } else if (platform === 'facebook') {
        // Facebook embed code
        if (input.includes('iframe') || input.includes('fb-')) {
            embedCode = input;
        } else {
            embedCode = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(input)}" width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`;
        }
    }
    
    return embedCode;
}

// Load All Posts
function loadAllPosts() {
    loadSocialPosts();
    loadActingPosts();
}

function loadSocialPosts() {
    const socialFeeds = JSON.parse(localStorage.getItem('socialFeeds') || '[]');
    
    if (socialFeeds.length === 0) {
        socialPostsList.innerHTML = '<p class="empty-message">No posts yet. Add some from the Social Media tab!</p>';
        return;
    }
    
    socialPostsList.innerHTML = socialFeeds.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h4>${post.description || 'Social Media Post'}</h4>
                <p>Added on ${post.date}</p>
                <span class="post-platform">${post.platform.toUpperCase()}</span>
            </div>
            <button class="btn-delete" onclick="deletePost('social', ${post.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

function loadActingPosts() {
    const actingVideos = JSON.parse(localStorage.getItem('actingVideos') || '[]');
    
    if (actingVideos.length === 0) {
        actingPostsList.innerHTML = '<p class="empty-message">No videos yet. Add some from the Acting Portfolio tab!</p>';
        return;
    }
    
    actingPostsList.innerHTML = actingVideos.map(video => `
        <div class="post-item">
            <div class="post-info">
                <h4>${video.title}</h4>
                <p>Added on ${video.date}</p>
                <span class="post-platform">${video.platform.toUpperCase()}</span>
            </div>
            <button class="btn-delete" onclick="deletePost('acting', ${video.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

// Delete Post
window.deletePost = function(type, id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    if (type === 'social') {
        let socialFeeds = JSON.parse(localStorage.getItem('socialFeeds') || '[]');
        socialFeeds = socialFeeds.filter(post => post.id !== id);
        localStorage.setItem('socialFeeds', JSON.stringify(socialFeeds));
    } else if (type === 'acting') {
        let actingVideos = JSON.parse(localStorage.getItem('actingVideos') || '[]');
        actingVideos = actingVideos.filter(video => video.id !== id);
        localStorage.setItem('actingVideos', JSON.stringify(actingVideos));
    }
    
    loadAllPosts();
};

// Show Success Message
function showSuccessMessage(form, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    form.parentNode.insertBefore(successDiv, form);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}
