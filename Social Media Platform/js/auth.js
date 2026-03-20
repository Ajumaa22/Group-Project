function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users){
    localStorage.setItem("users",JSON.stringify(users));
}

function setCurrentUser(user){
    localStorage.setItem("currentUser",JSON.stringify(user));
}
function getCurrentUser(){
    return JSON.parse(localStorage.getItem("currentUser"));
}
//register
const registerForm = document.getElementById("register-form");

if (registerForm){
    registerForm.addEventListener("submit", function(e){
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPass = document.getElementById("confirmPassword").value;
        if (password !== confirmPass ){
            alert("Password does not match.");
            return;
        }
            
        const dob = document.getElementById("dob").value;
        if (!username || !email || !password || !confirmPass){
            alert("Please fill in all required fields.");
            return;
        }
        if(username.length <3 ){
            alert("Username must be at least 3 characters long.");
            return;
        }
        if (password.length <6 ){
            alert("Password must be at least 6 characters long.");
            return;
        }
        const users= getUsers();
        const existingEmail= users.find( user => user.email === email);
        const existingUser = users.find( user => user.username === username);
        if (existingUser ){
            alert("An Account with this Username already exists.");
            return;
        }
        if (existingEmail ){
            alert("An Account with this Email already exists.");
            return;
        }
        const newUser= {
            id: Date.now(),
            username,
            email,
            password,
            dob,
            bio: "",
            profilePhoto:""
        };
        users.push(newUser);
        saveUsers(users);
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
    });
}
//login
const loginForm= document.getElementById("login-form");
if (loginForm){
    loginForm.addEventListener("submit",function(e){
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password){
            alert("Please enter your email and password.");
            return;
        }

        const users = getUsers();

        const matchUser = users.find(
            user => user.email === email && user.password==password
        );
        if(!matchUser){
            alert("invalid Email or Password.");
            return;
        }
        setCurrentUser(matchUser);
        window.location.href="profile.html";
    });
}
//protected routes
function requireLogin(){
    const currentUser = getCurrentUser();
    if (!currentUser){
        window.location.href = "login.html";
    }
}
if (window.location.pathname.includes("profile.html")){
    requireLogin();
}
//logout
const logoutBtn= document.getElementById("logout-Btn");

if(logoutBtn){
    logoutBtn.addEventListener("click", function(){
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}