// app.js - Main application logic for Social Media Platform

// DOM Elements
const postForm = document.getElementById('postForm');
const userPostsContainer = document.getElementById('userPostsContainer');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // If on profile page, initialize profile functionality
    if (window.location.pathname.includes('profile.html')) {
        initializeProfilePage();
    }
});

// Profile page initialization
function initializeProfilePage() {
    loadUserPosts();
    setupPostForm();
    updateProfileStats();
    updateProfileInfo();
}

// Post functions
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

function createPost(text) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const post = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        text: text,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
    };

    const posts = getPosts();
    posts.unshift(post); // Add to beginning
    savePosts(posts);

    return post;
}

function deletePost(postId) {
    const posts = getPosts();
    const filteredPosts = posts.filter(post => post.id !== postId);
    savePosts(filteredPosts);
}

// Load and display user's posts
function loadUserPosts() {
    const currentUser = getCurrentUser();
    const posts = getPosts();
    const userPosts = posts.filter(post => post.userId === currentUser.id);

    userPostsContainer.innerHTML = '';

    if (userPosts.length === 0) {
        userPostsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No posts yet. Create your first post!</p>';
        return;
    }

    userPosts.forEach(post => {
        const postElement = createPostElement(post);
        userPostsContainer.appendChild(postElement);
    });
}

// Create post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'user-post-card';
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="username">${post.username}</span>
            <span class="post-time">${formatTime(post.timestamp)}</span>
            <button class="delete-btn" onclick="deleteUserPost(${post.id})">🗑️</button>
        </div>
        <div class="post-content">
            <p class="post-text">${post.text}</p>
        </div>
        <div class="post-actions">
            <button class="like-btn" onclick="likePost(${post.id})">
                👍 Like <span class="like-count">${post.likes}</span>
            </button>
        </div>
    `;

    return postDiv;
}

// Delete user's post
function deleteUserPost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        deletePost(postId);
        loadUserPosts();
        updateProfileStats();
    }
}

// Like post
function likePost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        savePosts(posts);
        loadUserPosts();
    }
}

// Setup post form
function setupPostForm() {
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textarea = postForm.querySelector('textarea[name="post_text"]');
            const text = textarea.value.trim();

            if (text) {
                createPost(text);
                textarea.value = '';
                loadUserPosts();
                updateProfileStats();
            }
        });
    }
}

// Update profile stats
function updateProfileStats() {
    const currentUser = getCurrentUser();
    const posts = getPosts();
    const userPosts = posts.filter(post => post.userId === currentUser.id);

    const postsCountEl = document.getElementById('postsCount');
    if (postsCountEl) {
        postsCountEl.textContent = userPosts.length;
    }

    // Followers and following remain 0 for now
    const followersCountEl = document.getElementById('followersCount');
    const followingCountEl = document.getElementById('followingCount');
    if (followersCountEl) followersCountEl.textContent = '0';
    if (followingCountEl) followingCountEl.textContent = '0';
}

// Update profile info
function updateProfileInfo() {
    const currentUser = getCurrentUser();

    // Update username
    const usernameEl = document.querySelector('.profile-info h1');
    if (usernameEl) {
        usernameEl.textContent = currentUser.username;
    }

    // Update bio
    const bioEl = document.querySelector('.profile-info p');
    if (bioEl) {
        bioEl.textContent = currentUser.bio || 'No bio yet.';
    }

    // Update profile picture
    const profilePicEl = document.querySelector('.profile-pic img');
    if (profilePicEl) {
        profilePicEl.src = currentUser.profilePhoto || 'Icons/IMG_1049.PNG';
    }

    // Update post form profile picture
    const postProfilePicEl = document.querySelector('.post-action img');
    if (postProfilePicEl) {
        postProfilePicEl.src = currentUser.profilePhoto || 'Icons/IMG_1049.PNG';
    }
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}
