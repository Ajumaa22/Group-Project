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

    // If on profile-edit page, initialize edit profile functionality
    if (window.location.pathname.includes('profile-edit.html')) {
        initializeProfileEditPage();
    }

    // If on index page, initialize feed functionality
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        initializeFeedPage();
    }
});

// Feed page initialization
function initializeFeedPage() {
    loadPosts();
    setupPostCreation();
    setupNavigation();
    setupUserSearch();
    updateFeedProfilePic();
}

// Load all posts for feed
function loadPosts() {
    const posts = getPosts();
    const postsContainer = document.getElementById('postsContainer');

    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Be the first to post!</p>';
        return;
    }

    // Sort posts by timestamp (newest first)
    posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Setup post creation
function setupPostCreation() {
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postInput = document.getElementById('postInput');

    if (submitPostBtn && postInput) {
        submitPostBtn.addEventListener('click', () => {
            const text = postInput.value.trim();
            if (text) {
                createPost(text);
                postInput.value = '';
                loadPosts(); // Refresh feed
            }
        });
    }
}

// Create post element from template
function createPostElement(post) {
    const template = document.getElementById('postTemplate');
    if (!template) return null;

    const postElement = template.content.cloneNode(true);
    const postCard = postElement.querySelector('.post-card');
    const avatar = postCard.querySelector('.post-avatar');
    const users = getUsers();
    const postUser = users.find(u => u.id === post.userId);

    if (avatar) {
        avatar.src = postUser?.profilePhoto || 'Icons/IMG_1049.PNG';
    }

    // Set post data
    const usernameLink = postCard.querySelector('.username-link');
    usernameLink.textContent = post.username;
    usernameLink.dataset.userId = post.userId;
    usernameLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `profile.html?user=${post.userId}`;
    });

    postCard.querySelector('.post-time').textContent = formatTime(post.timestamp);
    postCard.querySelector('.post-text').textContent = post.text;
    postCard.querySelector('.like-count').textContent = post.likes;

    // Setup like button
    const likeBtn = postCard.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(post.id));

    // Setup comments
    const commentInput = postCard.querySelector('.comment-input');
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleComment(post.id, commentInput.value);
            commentInput.value = '';
        }
    });

    // Load existing comments
    const commentsList = postCard.querySelector('.comments-list');
    if (post.comments) {
        post.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
            commentsList.appendChild(commentDiv);
        });
    }

    return postCard;
}
function updateFeedProfilePic() {
    const currentUser = getCurrentUser();
    const users = getUsers();
    const feedProfilePic = document.getElementById('feedProfilePic');

    if (!feedProfilePic || !currentUser) return;

    const freshUser = users.find(user => user.id === currentUser.id) || currentUser;

    feedProfilePic.src = freshUser.profilePhoto || 'Icons/IMG_1049.PNG';
}

// Handle like
function handleLike(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        savePosts(posts);
        loadPosts(); // Refresh
    }
}

// Handle comment
function handleComment(postId, commentText) {
    if (!commentText.trim()) return;

    const currentUser = getCurrentUser();
    const comment = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        text: commentText,
        timestamp: new Date().toISOString()
    };

    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
        savePosts(posts);
        loadPosts(); // Refresh
    }
}

// Profile page initialization
function initializeProfilePage() {
    // Check if viewing another user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('user');

    if (profileUserId) {
        // Viewing another user's profile
        loadOtherUserProfile(profileUserId);
    } else {
        // Viewing own profile
        loadUserPosts();
        setupPostForm();
        updateProfileStats();
        updateProfileInfo();
        setupEditButton();
    }
}

function setupEditButton() {
    const editBtn = document.getElementById('edit-Btn');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
        window.location.href = 'profile-edit.html';
    });
}

function initializeProfileEditPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.querySelector('form');
    if (!form) return;

    const usernameInput = form.querySelector('input[name="username"]');
    const bioInput = form.querySelector('textarea[name="bio"]');
    const photoInput = form.querySelector('input[name="profile_photo"]');

    if (usernameInput) usernameInput.value = currentUser.username;
    if (bioInput) bioInput.value = currentUser.bio || '';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const desiredUsername = usernameInput.value.trim();
        const newBio = bioInput.value.trim();

        if (!desiredUsername || desiredUsername.length < 3) {
            alert('Username must be at least 3 characters.');
            return;
        }

        const users = getUsers();
        const usernameOwner = users.find(user => user.username.toLowerCase() === desiredUsername.toLowerCase());

        if (usernameOwner && usernameOwner.id !== currentUser.id) {
            alert('Username already exists. Please choose a different username.');
            return;
        }

        // Update profile photo if file selected
        if (photoInput.files && photoInput.files[0]) {
            const file = photoInput.files[0];
            const reader = new FileReader();
            reader.onload = function (loadEvent) {
                const newProfilePhoto = loadEvent.target.result;
                console.log("Loaded image:" , newProfilePhoto);
                saveProfileChanges(currentUser, desiredUsername, newBio, newProfilePhoto);
            };
            reader.readAsDataURL(file);
        } else {
            saveProfileChanges(currentUser, desiredUsername, newBio, currentUser.profilePhoto);
        }
    });
}

function saveProfileChanges(currentUser, newUsername, newBio, newProfilePhoto) {
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === currentUser.id);

    if (userIndex === -1) {
        alert('Current user not found. Please log in again.');
        window.location.href = 'login.html';
        return;
    }

    // Update user object
    currentUser.username = newUsername;
    currentUser.bio = newBio;
    if (newProfilePhoto) {
        currentUser.profilePhoto = newProfilePhoto;
    }

    users[userIndex] = currentUser;
    saveUsers(users);
    setCurrentUser(users[userIndex]);

    // Update posts for new username
    const posts = getPosts();
    const changedPosts = posts.filter(post => post.userId === currentUser.id);

    changedPosts.forEach(post => {
        post.username = newUsername;
    });

    savePosts(posts);

    alert('Profile updated successfully.');
    window.location.href = 'profile.html';
}

// Load another user's profile
function loadOtherUserProfile(username) {
    const users = getUsers();
    const decodedUsername = decodeURIComponent(username || '').trim();
    const profileUser = users.find(user => user.username.toLowerCase() === decodedUsername.toLowerCase());

    if (!profileUser) {
        alert('User not found');
        window.location.href = 'index.html';
        return;
    }

    // Load user's posts
    loadUserPostsForUser(profileUser.id);

    // Update profile info for this user
    updateProfileInfoForUser(profileUser);

    // Update stats for this user
    updateProfileStatsForUser(profileUser);

    // Add follow/unfollow button
    setupFollowButton(profileUser);
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

    // Update followers and following counts
    const followersCountEl = document.getElementById('followersCount');
    const followingCountEl = document.getElementById('followingCount');
    if (followersCountEl) followersCountEl.textContent = currentUser.followers ? currentUser.followers.length : 0;
    if (followingCountEl) followingCountEl.textContent = currentUser.following ? currentUser.following.length : 0;
}

// Update profile info
function updateProfileInfo() {
    const currentUser = getCurrentUser();
    const users = getUsers();
    const freshUser = users.find(user => user.id === currentUser.id) || currentUser;

    // Update username
    const usernameEl = document.querySelector('.profile-info h1');
    if (usernameEl) {
        usernameEl.textContent = freshUser.username;
    }

    // Update bio
    const bioEl = document.querySelector('.profile-info p');
    if (bioEl) {
        bioEl.textContent = freshUser.bio || 'No bio yet.';
    }

    // Update profile picture
    const profilePicEl = document.querySelector('.profile-pic img');
    if (profilePicEl) {
        profilePicEl.src = freshUser.profilePhoto || 'Icons/IMG_1049.PNG';
    }

    // Update post form profile picture
    const postProfilePicEl = document.querySelector('.post-action img');
    if (postProfilePicEl) {
        postProfilePicEl.src = freshUser.profilePhoto || 'Icons/IMG_1049.PNG';
    }
}

// Load posts for a specific user
function loadUserPostsForUser(userId) {
    const posts = getPosts();
    const userPosts = posts.filter(post => post.userId === userId);

    userPostsContainer.innerHTML = '';

    if (userPosts.length === 0) {
        userPostsContainer.innerHTML = '<p>No posts yet.</p>';
        return;
    }

    userPosts.forEach(post => {
        const postElement = createPostElementForUser(post);
        userPostsContainer.appendChild(postElement);
    });
}

// Create post element for viewing (no delete button for other users' posts)
function createPostElementForUser(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'user-post-card';
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="username">${post.username}</span>
            <span class="post-time">${formatTime(post.timestamp)}</span>
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

// Update profile info for a specific user
function updateProfileInfoForUser(user) {
    // Update username
    const usernameEl = document.querySelector('.profile-info h1');
    if (usernameEl) {
        usernameEl.textContent = user.username;
    }

    // Update bio
    const bioEl = document.querySelector('.profile-info p');
    if (bioEl) {
        bioEl.textContent = user.bio || 'No bio yet.';
    }

    // Update profile picture
    const profilePicEl = document.querySelector('.profile-pic img');
    if (profilePicEl) {
        profilePicEl.src = user.profilePhoto || 'Icons/IMG_1049.PNG';
    }
}

// Update profile stats for a specific user
function updateProfileStatsForUser(user) {
    const posts = getPosts();
    const userPosts = posts.filter(post => post.userId === user.id);

    const postsCountEl = document.getElementById('postsCount');
    if (postsCountEl) {
        postsCountEl.textContent = userPosts.length;
    }

    // Update followers and following counts
    const followersCountEl = document.getElementById('followersCount');
    const followingCountEl = document.getElementById('followingCount');
    if (followersCountEl) followersCountEl.textContent = user.followers ? user.followers.length : 0;
    if (followingCountEl) followingCountEl.textContent = user.following ? user.following.length : 0;
}

// Setup follow/unfollow button
function setupFollowButton(profileUser) {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.id === profileUser.id) {
        return;
    }

    const isFollowing = currentUser.following && currentUser.following.includes(profileUser.id);

    let followBtn = document.getElementById('followBtn');

    if (!followBtn) {
        followBtn = document.createElement('button');
        followBtn.id = 'followBtn';

        const editBtn = document.getElementById('edit-Btn');
        if (editBtn) {
            editBtn.parentNode.replaceChild(followBtn, editBtn);
        } else {
            const profileBox = document.querySelector('.profile-box');
            if (profileBox) {
                profileBox.appendChild(followBtn);
            }
        }
    }

    followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
    followBtn.className = isFollowing ? 'unfollow-btn' : 'follow-btn';
    followBtn.onclick = () => toggleFollow(profileUser.id);
}

// Toggle follow/unfollow
function toggleFollow(targetUserId) {
    const currentUser = getCurrentUser();
    const users = getUsers();

    const currentUserIndex = users.findIndex(user => user.id === currentUser.id);
    const targetUserIndex = users.findIndex(user => user.id == targetUserId);

    if (currentUserIndex === -1 || targetUserIndex === -1) return;

    const freshCurrentUser = users[currentUserIndex];
    const targetUser = users[targetUserIndex];

    freshCurrentUser.following = freshCurrentUser.following || [];
    targetUser.followers = targetUser.followers || [];

    const isFollowing = freshCurrentUser.following.includes(targetUserId);

    if (isFollowing) {
        freshCurrentUser.following = freshCurrentUser.following.filter(id => id != targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id != freshCurrentUser.id);
    } else {
        freshCurrentUser.following.push(targetUserId);
        targetUser.followers.push(freshCurrentUser.id);
    }

    users[currentUserIndex] = freshCurrentUser;
    users[targetUserIndex] = targetUser;

    saveUsers(users);
    setCurrentUser(freshCurrentUser);

    updateProfileStatsForUser(targetUser);
    setupFollowButton(targetUser);
}

function updateUser(updatedUser) {
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUsers(users);
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
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

// Setup navigation for feed page
function setupNavigation() {
    const homeNav = document.getElementById('homeNav');
    const profileNav = document.getElementById('profileNav');
    const logoutBtn = document.getElementById('logout-btn');

    if (homeNav) {
        homeNav.addEventListener('click', () => {
            // Already on home
            setActiveNav('homeNav');
        });
    }

    if (profileNav) {
        profileNav.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

function setActiveNav(activeId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.getElementById(activeId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Search functionality
function setupUserSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        // Clear results if query is empty
        if (query === '') {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performUserSearch(query);
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function performUserSearch(query) {
    const users = getUsers();
    const currentUser = getCurrentUser();
    const searchResults = document.getElementById('searchResults');

    if (!searchResults || !currentUser) return;

    // Filter users based on query (case insensitive) and not the current user
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase()) &&
        user.id !== currentUser.id
    );

    // Limit results to 5
    const results = filteredUsers.slice(0, 5);

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No users found</div>';
        searchResults.style.display = 'block';
        return;
    }

    searchResults.innerHTML = results.map(user => createSearchResultItem(user)).join('');
    searchResults.style.display = 'block';
}

function createSearchResultItem(user) {
    const currentUser = getCurrentUser();
    const isFollowing = currentUser.following && currentUser.following.includes(user.id);

    return `
        <div class="search-result-item">
            <div class="search-user-info">
                <a href="profile.html?user=${encodeURIComponent(user.username)}" class="search-username">${user.username}</a>
            </div>
            <button class="follow-btn ${isFollowing ? 'following' : ''}" 
                    onclick="handleSearchFollow(${user.id}, event)">
                ${isFollowing ? 'Following' : 'Follow'}
            </button>
        </div>
    `;
}

function handleSearchFollow(targetUserId, event) {
    event.preventDefault();
    event.stopPropagation();

    const currentUser = getCurrentUser();
    const users = getUsers();
    const targetUser = users.find(u => u.id === targetUserId);

    if (!currentUser || !targetUser) return;

    const isFollowing = currentUser.following && currentUser.following.includes(targetUserId);

    if (isFollowing) {
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        targetUser.followers = (targetUser.followers || []).filter(id => id !== currentUser.id);
    } else {
        currentUser.following = currentUser.following || [];
        targetUser.followers = targetUser.followers || [];

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUser.id);
    }

    // Update users in localStorage
    updateUser(currentUser);
    updateUser(targetUser);

    // Update button text and class
    const button = event.target;
    button.textContent = isFollowing ? 'Follow' : 'Following';
    button.classList.toggle('following');

    // Refresh search results to update all buttons
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        performUserSearch(searchInput.value.trim());
    }
}
