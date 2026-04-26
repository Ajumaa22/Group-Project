// ================= AUTH =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
}

// ================= LOAD TARGET USER =================
const viewingUserId = parseInt(sessionStorage.getItem("viewingUserId"));

if (!viewingUserId) {
    window.location.href = "index.html";
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getPosts() {
    return JSON.parse(localStorage.getItem("posts")) || [];
}

const DEFAULT_PROFILE_IMG = "icons/user-round (1).svg";

function getProfileImage(photo) {
    return photo && photo.trim() !== "" ? photo : DEFAULT_PROFILE_IMG;
}

// ================= RENDER PROFILE =================
let users = getUsers();

// Ensure all users have followers/following arrays
users.forEach(u => {
    if (!u.followers) u.followers = [];
    if (!u.following) u.following = [];
});
saveUsers(users);

const viewedUser = users.find(u => u.id === viewingUserId);

if (!viewedUser) {
    alert("User not found.");
    window.location.href = "index.html";
}

document.getElementById("userProfileImage").src = getProfileImage(viewedUser.profilePhoto);
document.getElementById("userUsername").textContent = viewedUser.username;
document.getElementById("userBio").textContent = viewedUser.bio || "No bio yet.";
document.getElementById("userFollowersCount").textContent = viewedUser.followers.length;
document.getElementById("userFollowingCount").textContent = viewedUser.following.length;

// ================= POSTS =================
const posts = getPosts();
const userPosts = posts
    .filter(p => p.userId === viewingUserId)
    .sort((a, b) => b.id - a.id);

document.getElementById("userPostsCount").textContent = userPosts.length;

const postsContainer = document.getElementById("userPostsContainer");

const postModal = document.getElementById("postModal");
const postModalBody = document.getElementById("postModalBody");
const closePostModal = document.getElementById("closePostModal");

function openPostModal(post) {
    if (!postModal || !postModalBody) return;

    postModalBody.innerHTML = "";

    const modalCard = document.createElement("div");
    modalCard.classList.add("post-card");

    const likesArray = Array.isArray(post.likes) ? post.likes : [];
    const commentsArray = Array.isArray(post.comments) ? post.comments : [];

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
            <span class="like-count">${likesArray.length}</span>
        </div>

        <div class="comments-section">
            <div class="comments-list"></div>
            <input class="comment-input" type="text" placeholder="Write a comment...">
        </div>
    `;

    const likeBtn = modalCard.querySelector(".like-btn");
    const likeCount = modalCard.querySelector(".like-count");
    const commentsList = modalCard.querySelector(".comments-list");
    const commentInput = modalCard.querySelector(".comment-input");

    if (commentsArray.length > 0) {
        commentsArray.forEach(comment => {
            const p = document.createElement("p");
            p.textContent = `${comment.username}: ${comment.text}`;
            commentsList.appendChild(p);
        });
    } else {
        commentsList.innerHTML = "<p>No comments yet.</p>";
    }

    likeBtn.addEventListener("click", () => {
        if (!Array.isArray(post.likes)) {
            post.likes = [];
        }

        if (post.likes.includes(currentUser.id)) {
            post.likes = post.likes.filter(id => id !== currentUser.id);
        } else {
            post.likes.push(currentUser.id);
        }

        likeCount.textContent = post.likes.length;
        localStorage.setItem("posts", JSON.stringify(posts));
    });

    commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const text = commentInput.value.trim();
            if (!text) return;

            if (!Array.isArray(post.comments)) {
                post.comments = [];
            }

            const newComment = {
                userId: currentUser.id,
                username: currentUser.username,
                text: text
            };

            post.comments.push(newComment);
            localStorage.setItem("posts", JSON.stringify(posts));

            if (commentsList.innerHTML.includes("No comments yet.")) {
                commentsList.innerHTML = "";
            }

            const p = document.createElement("p");
            p.textContent = `${newComment.username}: ${newComment.text}`;
            commentsList.appendChild(p);

            commentInput.value = "";
        }
    });

    postModalBody.appendChild(modalCard);
    postModal.classList.remove("hidden");
}
userPosts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post-card");

    div.innerHTML = `
        <p><strong>${post.username}</strong></p>
        <p>${post.text}</p>
        <small>${post.time}</small>
    `;

    div.style.cursor = "pointer";

    div.addEventListener("click", () => {
    openPostModal(post);
});

    postsContainer.appendChild(div);
});
if (closePostModal) {
    closePostModal.addEventListener("click", () => {
        postModal.classList.add("hidden");
    });
}

if (postModal) {
    postModal.addEventListener("click", (e) => {
        if (e.target === postModal) {
            postModal.classList.add("hidden");
        }
    });
}

// ================= FOLLOW / UNFOLLOW =================
const followBtn = document.getElementById("followBtn");

let loggedInUser = users.find(u => u.id === currentUser.id);

function renderFollowBtn() {
    const isFollowing = viewedUser.followers.includes(currentUser.id);
    followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
    followBtn.classList.toggle("following", isFollowing);
}

renderFollowBtn();

followBtn.addEventListener("click", () => {
    users = getUsers();

    const viewed = users.find(u => u.id === viewingUserId);
    const logged = users.find(u => u.id === currentUser.id);

    const isFollowing = viewed.followers.includes(currentUser.id);

    if (isFollowing) {
        // Unfollow
        viewed.followers = viewed.followers.filter(id => id !== currentUser.id);
        logged.following = logged.following.filter(id => id !== viewingUserId);
    } else {
        // Follow
        viewed.followers.push(currentUser.id);
        logged.following.push(viewingUserId);
    }

    saveUsers(users);

    // Update counts on screen
    document.getElementById("userFollowersCount").textContent = viewed.followers.length;

    // Flip button
    const nowFollowing = viewed.followers.includes(currentUser.id);
    followBtn.textContent = nowFollowing ? "Unfollow" : "Follow";
    followBtn.classList.toggle("following", nowFollowing);
});
