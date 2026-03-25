// ================= HELPERS =================
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Only saves essential user data
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

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// ================= REGISTER =================
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPass = document.getElementById("confirmPassword").value;
        const dob = document.getElementById("dob").value;

        if (!username || !email || !password || !confirmPass) {
            alert("Please fill in all required fields.");
            return;
        }
        if (username.length < 3) {
            alert("Username must be at least 3 characters long.");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPass) {
            alert("Passwords do not match.");
            return;
        }

        const users = getUsers();

        if (users.find(u => u.username === username)) {
            alert("An account with this username already exists.");
            return;
        }
        if (users.find(u => u.email === email)) {
            alert("An account with this email already exists.");
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            dob: dob || "",
            bio: "",
            profilePhoto: "",
            followers: [],
            following: []
        };

        users.push(newUser);
        saveUsers(users);

        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
    });
}

// ================= LOGIN =================
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        const users = getUsers();
        const matchUser = users.find(u => u.email === email && u.password === password);

        if (!matchUser) {
            alert("Invalid email or password.");
            return;
        }

        setCurrentUser(matchUser);
        window.location.href = "index.html";
    });
}

// ================= PROTECTED ROUTES =================
function requireLogin() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
    }
    return currentUser;
}

if (window.location.pathname.includes("profile.html") ||
    window.location.pathname.includes("profile-edit.html")) {
    requireLogin();
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logout-Btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}
