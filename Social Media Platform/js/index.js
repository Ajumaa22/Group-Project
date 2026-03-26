// ================= AUTH =================
function requireLogin() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        window.location.href = "login.html";
    }
    return user;
}

const currentUser = requireLogin();

const DEFAULT_PROFILE_IMG = "icons/user-round (1).svg";

function getProfileImage(photo) {
    return photo && photo.trim() !== "" ? photo : DEFAULT_PROFILE_IMG;
}

// ================= NAVIGATION =================
document.getElementById("navUsername").textContent = currentUser.username;
document.getElementById("navProfileImg").src = getProfileImage(currentUser.profilePhoto);
document.getElementById("profileNav").onclick = () => {
    window.location.href = "profile.html";
};

document.getElementById("homeNav").onclick = () => {
    window.location.href = "index.html";
};

// ================= FOLLOWING LIST =================
function renderFollowingList() {
    const followingList = document.getElementById("followingList");
    followingList.innerHTML = "";

    const users = getUsers();

    // Get the logged-in user's fresh data from users array
    const loggedIn = users.find(u => u.id === currentUser.id);
    if (!loggedIn || !loggedIn.following || loggedIn.following.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Not following anyone yet.";
        empty.style.fontSize = "13px";
        empty.style.color = "#999";
        empty.style.padding = "8px 0";
        followingList.appendChild(empty);
        return;
    }

    loggedIn.following.forEach(followedId => {
        const followed = users.find(u => u.id === followedId);
        if (!followed) return;

        const li = document.createElement("li");
        li.classList.add("following-item");
        li.innerHTML = `
            <img src="${getProfileImage(followed.profilePhoto)}" class="following-img">
            <span>${followed.username}</span>
        `;

        // Clicking a following user opens their profile
        li.style.cursor = "pointer";
        li.addEventListener("click", () => {
            sessionStorage.setItem("viewingUserId", followed.id);
            window.location.href = "user-profile.html";
        });

        followingList.appendChild(li);
    });
}

renderFollowingList();

// ================= STORAGE =================
function getPosts() {
    return JSON.parse(localStorage.getItem("posts")) || [];
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// ================= DOM =================
const postInput = document.getElementById("postInput");
const submitPostBtn = document.getElementById("submitPostBtn");
const postsContainer = document.getElementById("postsContainer");
const template = document.getElementById("postTemplate");
const postModal = document.getElementById("postModal");
const postModalBody = document.getElementById("postModalBody");
const closePostModal = document.getElementById("closePostModal");

// ================= LOAD POSTS =================
function getFilteredPosts() {
    const allUsers = getUsers();
    const loggedIn = allUsers.find(u => u.id === currentUser.id);
    const following = loggedIn?.following || [];

    return getPosts()
        .filter(p => p.userId === currentUser.id || following.includes(p.userId))
        .sort((a, b) => b.id - a.id);
}

let posts = getFilteredPosts();
posts.forEach(renderPost);

// ================= CREATE POST =================
submitPostBtn.addEventListener("click", () => {
    const text = postInput.value.trim();
    if (!text) return alert("Write something!");

    const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: getProfileImage(currentUser.profilePhoto),
        text: text,
        time: new Date().toLocaleString(),
        likes: [],
        comments: []
    };

    const allPosts = getPosts();
    allPosts.unshift(newPost);
    savePosts(allPosts);

    posts = getFilteredPosts();
    postsContainer.innerHTML = "";
    posts.forEach(renderPost);
    postInput.value = "";
});

function openPostModal(post) {
    postModalBody.innerHTML = "";

    const modalCard = document.createElement("article");
    modalCard.classList.add("post-card");

    const commentsHtml = post.comments && post.comments.length > 0
        ? post.comments.map(c => `<p>${c.username}: ${c.text}</p>`).join("")
        : "<p>No comments yet.</p>";

    modalCard.innerHTML = `
        <div class="post-header">
            <img class="profile-img" src="${getProfileImage(post.profilePic)}" alt="profile">
            <div class="user-info">
                <span class="username">${post.username}</span>
                <span class="post-time">${post.time}</span>
            </div>
        </div>

        <p class="post-text">${post.text}</p>

        ${post.image ? `<img class="post-image" src="${post.image}" alt="post image">` : ""}

        <div class="post-actions">
            <button class="like-btn">👍 Like</button>
            <span class="like-count">${post.likes.length}</span>
        </div>

        <div class="comments-section">
            <div class="comments-list">${commentsHtml}</div>
            <input class="comment-input" placeholder="Write a comment...">
        </div>
    `;

    const likeBtn = modalCard.querySelector(".like-btn");
    const likeCount = modalCard.querySelector(".like-count");
    const commentInput = modalCard.querySelector(".comment-input");
    const commentsList = modalCard.querySelector(".comments-list");

    likeBtn.onclick = () => {
        if (post.likes.includes(currentUser.id)) {
            post.likes = post.likes.filter(id => id !== currentUser.id);
        } else {
            post.likes.push(currentUser.id);
        }

        likeCount.textContent = post.likes.length;
        savePosts(getPosts().map(p => p.id === post.id ? post : p));

        posts = getFilteredPosts();
        postsContainer.innerHTML = "";
        posts.forEach(renderPost);
    };

    commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const text = commentInput.value.trim();
            if (!text) return;

            const comment = {
                userId: currentUser.id,
                username: currentUser.username,
                text
            };

            post.comments.push(comment);
            savePosts(posts);

            if (commentsList.innerHTML.includes("No comments yet.")) {
                commentsList.innerHTML = "";
            }

            const p = document.createElement("p");
            p.textContent = `${comment.username}: ${comment.text}`;
            commentsList.appendChild(p);

            commentInput.value = "";

            posts = getFilteredPosts();
            postsContainer.innerHTML = "";
            posts.forEach(renderPost);
        }
    });

    postModalBody.appendChild(modalCard);
    postModal.classList.remove("hidden");
}
closePostModal.addEventListener("click", () => {
    postModal.classList.add("hidden");
});

postModal.addEventListener("click", (e) => {
    if (e.target === postModal) {
        postModal.classList.add("hidden");
    }
});

// ================= RENDER POST =================
function renderPost(post) {
    const clone = template.content.cloneNode(true);
    const postCard = clone.querySelector(".post-card");
    
    postCard.addEventListener("click", () => {
        openPostModal(post);
    });

    clone.querySelector(".username").textContent = post.username;
    clone.querySelector(".post-time").textContent = post.time;
    clone.querySelector(".post-text").textContent = post.text;
    clone.querySelector(".profile-img").src = getProfileImage(post.profilePic);

    // Clicking the username or profile pic opens that user's profile
    const usernameEl = clone.querySelector(".username");
    const profileImgEl = clone.querySelector(".profile-img");

    if (post.userId !== currentUser.id) {
        usernameEl.style.cursor = "pointer";
        usernameEl.style.textDecoration = "underline";
        profileImgEl.style.cursor = "pointer";

        const openProfile = (e) => {
            e.stopPropagation();
            openUserProfile(post.userId);
        };

        usernameEl.onclick = openProfile;
        profileImgEl.onclick = openProfile;
    }

    const likeBtn = clone.querySelector(".like-btn");
    const likeCount = clone.querySelector(".like-count");

    likeCount.textContent = post.likes.length;

    likeBtn.onclick = (e) => {
        e.stopPropagation();
        if (post.likes.includes(currentUser.id)) {
            post.likes = post.likes.filter(id => id !== currentUser.id);
        } else {
            post.likes.push(currentUser.id);
        }
        likeCount.textContent = post.likes.length;
        savePosts(posts);
    };

    // ================= COMMENTS =================
    const commentInput = clone.querySelector(".comment-input");
    const commentsList = clone.querySelector(".comments-list");

    commentInput.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    post.comments.forEach(c => {
        const p = document.createElement("p");
        p.textContent = `${c.username}: ${c.text}`;
        commentsList.appendChild(p);
    });

    commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const text = commentInput.value.trim();
            if (!text) return;

            const comment = {
                userId: currentUser.id,
                username: currentUser.username,
                text
            };

            post.comments.push(comment);
            savePosts(posts);

            const p = document.createElement("p");
            p.textContent = `${comment.username}: ${comment.text}`;
            commentsList.appendChild(p);

            commentInput.value = "";
        }
    });

    // ================= EDIT / DELETE =================
    if (post.userId === currentUser.id) {
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️ Edit";
        editBtn.classList.add("edit-post-btn");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ Delete";
        deleteBtn.classList.add("delete-post-btn");

        const controls = document.createElement("div");
        controls.classList.add("post-controls");
        controls.append(editBtn, deleteBtn);
        clone.querySelector(".post-actions").append(controls);

        editBtn.onclick = (e) => {
            e.stopPropagation();
            const newText = prompt("Edit post:", post.text);
            if (!newText) return;

            post.text = newText;
            savePosts(getPosts().map(p => p.id === post.id ? post : p));

            posts = getFilteredPosts();
            postsContainer.innerHTML = "";
            posts.forEach(renderPost);
        };

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (!confirm("Delete post?")) return;

            const allPosts = getPosts().filter(p => p.id !== post.id);
            savePosts(allPosts);

            posts = getFilteredPosts();
            postsContainer.innerHTML = "";
            posts.forEach(renderPost);
        };
    }

    postsContainer.appendChild(clone);
}

// ================= SEARCH =================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";

    if (!query) {
        searchResults.style.display = "none";
        return;
    }

    const users = getUsers();

    // Filter out the current user — no point searching yourself
    const matches = users.filter(u =>
        u.id !== currentUser.id &&
        u.username.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        searchResults.style.display = "none";
        return;
    }

    matches.forEach(user => {
        const item = document.createElement("div");
        item.classList.add("search-result-item");

        item.innerHTML = `
            <img src="${getProfileImage(user.profilePhoto)}" class="search-result-img">
            <span>${user.username}</span>
        `;

        item.addEventListener("click", () => {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            searchInput.value = "";
            openUserProfile(user.id);
        });

        searchResults.appendChild(item);
    });

    searchResults.style.display = "block";
});

// Close search results when clicking outside
document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
    }
});

// ================= OPEN USER PROFILE =================
// Saves the target user's id to sessionStorage then navigates to user-profile.html
function openUserProfile(userId) {
    sessionStorage.setItem("viewingUserId", userId);
    window.location.href = "user-profile.html";
}