// ================= HELPERS ================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// Only saves essential, lightweight user data — never posts or comments
function setCurrentUser(user) {
    const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePhoto: user.profilePhoto || ""
    };
    localStorage.setItem("currentUser", JSON.stringify(safeUser));
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
// ================= IMAGE COMPRESSION =================
// Resizes photo to max 200px and compresses to JPEG at 60% quality.

function compressImage(file, callback) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const MAX_SIZE = 200;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height = Math.round(height * MAX_SIZE / width);
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width = Math.round(width * MAX_SIZE / height);
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // 0.6 quality = ~90% smaller than the original base64
            const compressed = canvas.toDataURL("image/jpeg", 0.6);
            callback(compressed);
        };

        img.onerror = function () {
            alert("Failed to process image. Please try a different file.");
        };

        img.src = e.target.result;
    };

    reader.onerror = function () {
        alert("Failed to read image. Please try a different file.");
    };

    reader.readAsDataURL(file);
}

// ================= AUTH CHECK =================
const currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "login.html";
}

// ================= DETECT PAGE =================
const isProfilePage = document.getElementById("postsContainer");
const isEditPage = document.querySelector("form");
const postModal = document.getElementById("postModal");
const postModalBody = document.getElementById("postModalBody");
const closePostModal = document.getElementById("closePostModal");
// ================= PROFILE PAGE =================
if (isProfilePage) {

    document.getElementById("username").textContent = currentUser.username;
    document.getElementById("bio").textContent = currentUser.bio || "No bio yet.";
    document.getElementById("profileImage").src =
    currentUser.profilePhoto && currentUser.profilePhoto.trim() !== ""
        ? currentUser.profilePhoto
        : "icons/user-round (1).svg";

    // ================= USER'S POSTS =================
    const postsContainer = document.getElementById("postsContainer");
    const posts = getPosts();

        const userPosts = posts
        .filter(post => post.userId === currentUser.id)
        .sort((a, b) => b.id - a.id);

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
        commentsList.innerHTML = "";
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

    // ================= COUNTS =================
    document.getElementById("postsCount").textContent = userPosts.length;

    let users = getUsers();
    users.forEach(user => {
        if (!user.followers) user.followers = [];
        if (!user.following) user.following = [];
    });
    saveUsers(users);

    const updatedUser = users.find(u => u.id === currentUser.id);
    document.getElementById("followersCount").textContent = updatedUser ? updatedUser.followers.length : 0;
    document.getElementById("followingCount").textContent = updatedUser ? updatedUser.following.length : 0;

    // ================= EDIT BUTTON =================
    const editBtn = document.getElementById("edit-Btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = "profile-edit.html";
        });
    }
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
}


// ================= EDIT PROFILE PAGE =================
if (isEditPage) {

    const usernameInput = document.getElementById("username");
    const bioInput = document.getElementById("bio");
    const fileInput = document.getElementById("profile_photo");
    const saveBtn = document.getElementById("saveChangesBtn");

    usernameInput.value = currentUser.username || "";
    bioInput.value = currentUser.bio || "";

    saveBtn.addEventListener("click", function () {

        const newUsername = usernameInput.value.trim();
        const newBio = bioInput.value.trim();
        const file = fileInput.files[0];

        let users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            alert("User not found. Please log in again.");
            window.location.href = "login.html";
            return;
        }

        if (newUsername) {
            users[userIndex].username = newUsername;
        }
        users[userIndex].bio = newBio;

        if (file) {
            // Compress first, then save
            compressImage(file, function (compressedBase64) {
                users[userIndex].profilePhoto = compressedBase64;

                saveUsers(users);
                setCurrentUser(users[userIndex]);
                updatePostsProfilePic(currentUser.id, compressedBase64, users[userIndex].username);

                alert("Profile updated!");
                window.location.href = "profile.html";
            });

        } else {
            saveUsers(users);
            setCurrentUser(users[userIndex]);
            updatePostsProfilePic(currentUser.id, null, users[userIndex].username);

            alert("Profile updated!");
            window.location.href = "profile.html";
        }
    });
}


// Updates username/photo on all posts AND comments made by this user
function updatePostsProfilePic(userId, newPhoto, newUsername) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts.forEach(post => {
        // Update the post itself if owned by this user
        if (post.userId === userId) {
            if (newUsername) post.username = newUsername;
            if (newPhoto) post.profilePic = newPhoto;
        }

        // Update any comments this user left on ANY post
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
                if (comment.userId === userId) {
                    if (newUsername) comment.username = newUsername;
                }
            });
        }
    });

    localStorage.setItem("posts", JSON.stringify(posts));
}
