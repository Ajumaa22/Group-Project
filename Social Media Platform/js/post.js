(() => {
    // ================= AUTH =================
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const DEFAULT_PROFILE_IMG = "icons/user-round (1).svg";

    function getProfileImage(photo) {
        return photo && photo.trim() !== "" ? photo : DEFAULT_PROFILE_IMG;
    }

    function getPosts() {
        return JSON.parse(localStorage.getItem("posts")) || [];
    }

    function savePosts(posts) {
        localStorage.setItem("posts", JSON.stringify(posts));
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    
    const selectedPostId = Number(sessionStorage.getItem("selectedPostId"));
    const posts = getPosts();
    const post = posts.find(p => p.id === selectedPostId);

    console.log("selectedPostId:", selectedPostId);
    console.log("posts:", posts);
    console.log("found post:", post);

    // ================= NAVBAR =================
    const postNavUsername = document.getElementById("navUsername");
    const postNavProfileImg = document.getElementById("navProfileImg");
    const postHomeNav = document.getElementById("homeNav");
    const postProfileNav = document.getElementById("profileNav");
    const postLogoutBtn = document.getElementById("logout-Btn");
    const followingList = document.getElementById("followingList");

    if (postNavUsername) {
        postNavUsername.textContent = currentUser.username;
    }

    if (postNavProfileImg) {
        postNavProfileImg.src = getProfileImage(currentUser.profilePhoto);
    }

    if (postHomeNav) {
        postHomeNav.onclick = () => {
            window.location.href = "index.html";
        };
    }

    if (postProfileNav) {
        postProfileNav.onclick = () => {
            window.location.href = "profile.html";
        };
    }

    if (postLogoutBtn) {
        postLogoutBtn.onclick = () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        };
    }

    // ================= FOLLOWING =================
    function renderFollowingList() {
        if (!followingList) return;

        followingList.innerHTML = "";
        const users = getUsers();
        const loggedIn = users.find(u => u.id === currentUser.id);

        if (!loggedIn || !loggedIn.following || loggedIn.following.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Not following anyone yet.";
            followingList.appendChild(li);
            return;
        }

        loggedIn.following.forEach(followedId => {
            const followed = users.find(u => u.id === followedId);
            if (!followed) return;

            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${getProfileImage(followed.profilePhoto)}" class="following-img">
                <span>${followed.username}</span>
            `;

            li.style.cursor = "pointer";
            li.onclick = () => {
                sessionStorage.setItem("viewingUserId", followed.id);
                window.location.href = "user-profile.html";
            };

            followingList.appendChild(li);
        });
    }

    renderFollowingList();

    // ================= SINGLE POST =================
    const singlePostContainer = document.getElementById("singlePostContainer");
    const template = document.getElementById("singlePostTemplate");

    console.log("singlePostContainer:", singlePostContainer);
    console.log("template:", template);

    if (!singlePostContainer) {
        console.error("singlePostContainer not found");
        return;
    }

    if (!template) {
        console.error("singlePostTemplate not found");
        return;
    }

    if (!selectedPostId) {
        singlePostContainer.innerHTML = "<p>No post selected.</p>";
        return;
    }

    if (!post) {
        singlePostContainer.innerHTML = "<p>Post not found.</p>";
        return;
    }

    const clone = template.content.cloneNode(true);

    const profileImg = clone.querySelector(".profile-img");
    const username = clone.querySelector(".username");
    const postTime = clone.querySelector(".post-time");
    const postText = clone.querySelector(".post-text");
    const likeBtn = clone.querySelector(".like-btn");
    const likeCount = clone.querySelector(".like-count");
    const commentsList = clone.querySelector(".comments-list");
    const commentInput = clone.querySelector(".comment-input");

    profileImg.src = getProfileImage(post.profilePic);
    username.textContent = post.username;
    postTime.textContent = post.time;
    postText.textContent = post.text;
    likeCount.textContent = Array.isArray(post.likes) ? post.likes.length : 0;

    if (post.comments && post.comments.length > 0) {
        commentsList.innerHTML = "";
        post.comments.forEach(comment => {
            const p = document.createElement("p");
            p.textContent = `${comment.username}: ${comment.text}`;
            commentsList.appendChild(p);
        });
    } else {
        commentsList.innerHTML = "<p>No comments yet.</p>";
    }

    likeBtn.onclick = () => {
        if (!Array.isArray(post.likes)) post.likes = [];

        if (post.likes.includes(currentUser.id)) {
            post.likes = post.likes.filter(id => id !== currentUser.id);
        } else {
            post.likes.push(currentUser.id);
        }

        likeCount.textContent = post.likes.length;
        savePosts(posts);
    };

    commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const text = commentInput.value.trim();
            if (!text) return;

            const comment = {
                userId: currentUser.id,
                username: currentUser.username,
                text: text
            };

            if (!Array.isArray(post.comments)) post.comments = [];
            post.comments.push(comment);
            savePosts(posts);

            if (commentsList.innerHTML.includes("No comments yet.")) {
                commentsList.innerHTML = "";
            }

            const p = document.createElement("p");
            p.textContent = `${comment.username}: ${comment.text}`;
            commentsList.appendChild(p);

            commentInput.value = "";
        }
    });

    singlePostContainer.appendChild(clone);
})();