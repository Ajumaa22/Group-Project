# Work Division (Updated)

### **Aya – CSS & UI/UX Design**

**Responsibilities:**

* Design all pages: layout, colors, typography, spacing
* Implement Instagram-style feed, story bar, sidebar
* Make site responsive (desktop + mobile)
* Implement dark mode toggle
* Add hover effects, animations, smooth transitions

**Files:**

* `css/style.css`
* Minor HTML adjustments for design purposes

---



### **Maissa – Authentication & Session Management**

**Responsibilities:**

* Register / Login forms with validation (email, password strength)
* Handle `localStorage` for user accounts
* Implement session management (`currentUser`)
* Protect pages from unauthorized access
* Logout functionality

**Pages / Files:**

* `register.html`, `login.html`
* JS portions in `app.js` related to auth/session

---

### **Asmaa – Posts & News Feed**

**Responsibilities:**

* Create / Delete posts (text-based)
* Render posts dynamically in news feed (`index.html`)
* Likes and comments functionality (real-time, no reload)
* Single post view (`post.html`) with comments display
* Real-time DOM updates for posts, likes, comments

**Files:**

* `index.html`, `post.html`
* JS portions in `app.js` for posts, likes, comments

---

### **Khawla – Profile & Follow System**

**Responsibilities:**

* Profile page (`profile.html`) showing username, bio, profile pic, posts
* Edit bio / profile picture functionality (if time allows)
* Follow / unfollow other users
* Filter news feed to show posts from followed users only
* Real-time follow/unfollow updates

**Files:**

* `profile.html`
* JS portions in `app.js` for profile + follow/unfollow

---

# ✅ Checklist for All Members

Each member should tick these items as they complete them to track progress:

---

### **Maissa Checklist – Auth & Sessions**

* [X] Register page implemented with form validation
* [X] Login page implemented with form validation
* [X] Users stored in `localStorage` as JSON
* [X] Session (`currentUser`) created on login
* [X] Logout implemented
* [X] Protected routes for pages that require login
* [X] Redirect to login if not logged in

---

### **Aya Checklist – CSS / UI/UX**

* [ ] Navbar layout consistent across all pages
* [ ] Responsive layout (desktop + mobile)
* [ ] Sidebar with profile info implemented
* [ ] Story bar implemented on feed
* [ ] Post cards styled and consistent
* [ ] Buttons styled, hover effects added
* [ ] Dark mode toggle working
* [ ] Smooth animations for posts, hover, likes

---

### **Asmaa Checklist – Posts & News Feed**

* [ ] Post creation (real-time, no reload)
* [ ] Delete post functionality
* [ ] Render posts dynamically in news feed
* [ ] Single post view implemented
* [ ] Like system with real-time count
* [ ] Comment system (real-time)
* [ ] Posts display timestamp correctly
* [ ] Integration with follow filter

---

### **Khawla Checklist – Profile & Follow**

* [ ] Profile page shows username, bio, posts
* [ ] Edit profile (bio + picture) implemented
* [ ] Follow / Unfollow functionality working
* [ ] Update follower/following count dynamically
* [ ] News feed filters posts from followed users only
* [ ] Integration with posts & comments system

---
