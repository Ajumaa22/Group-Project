"use client";

import "./home.css";
import { useEffect, useState } from "react";
import { useRouter,usePathname  } from "next/navigation";
import Link from "next/link";



export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    function handleLogoClick() {
    if (pathname === "/") {
        window.location.reload(); // refresh if already home
    } else {
        router.push("/"); // go to home
    }
    }
    const [user, setUser] = useState(null);
    const [postText, setPostText] = useState("");
    const [posts, setPosts] = useState([]);

  useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) {
    router.push("/login");
  } else {
    setUser(JSON.parse(storedUser));
  }

  setLoading(false);
}, []);

  async function loadPosts() {
  try {
    const response = await fetch("/api/posts");
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("API /api/posts did not return JSON:", text);
      setPosts([]);
      return;
    }

    setPosts(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading posts:", error);
    setPosts([]);
  }
}

  async function handleCreatePost() {
    if (!postText.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postText,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        alert("Post could not be created. Please check the posts API.");
        return;
      }

      const newPost = await response.json();

      setPosts([newPost, ...posts]);
      setPostText("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while creating the post.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  const username = user?.username || user?.name || user?.email || "User";
  if (loading) {
  return null;
}
  return (
    <div className="page-shell">
      <header id="navbar">
        <div className="nav-left">
          <h2 id="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>Momenta</h2>
        </div>

        <div className="nav-center">
          <input
            type="search"
            id="searchInput"
            placeholder="Search users..."
            autoComplete="off"
          />
          <div id="searchResults"></div>
        </div>

        <div className="nav-right">
          <span id="navUsername">{username}</span>
          <button id="logout-Btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div id="layout">
        <aside id="sidebar">
          <nav id="mainNav">
            <ul>
              <li className="nav-item active">
                <div className="nav-icon">🏠</div>
                <span>Home</span>
              </li>

              <li>
                <Link href="/posts" className="nav-item">
                  <div className="nav-icon">📝</div>
                  <span>Posts</span>
                </Link>
              </li>

              <li>
                <Link href="/stats" className="nav-item">
                  <div className="nav-icon">📊</div>
                  <span>Stats</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div id="followingSection">
            <h4>Following</h4>
            <ul id="followingList">
              <li className="following-item">
                <span>{username}</span>
              </li>
            </ul>
          </div>
        </aside>

        <main id="feed">
          <section id="createPost">
            <textarea
              id="postInput"
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            ></textarea>

            <button id="submitPostBtn" onClick={handleCreatePost}>
              Post
            </button>
          </section>

          <section id="postsContainer">
            {posts.length === 0 ? (
              <p className="no-posts-msg">
                No posts available yet. Create your first post.
              </p>
            ) : (
              posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-header">
                    <img
                      className="profile-img"
                      src="/Icons/user-round (1).svg"
                      alt="profile"
                    />

                    <div className="user-info">
                      <span className="username">
                        {post.user?.username ||
                          post.author?.username ||
                          post.username ||
                          username}
                      </span>

                      <span className="post-time">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : "Just now"}
                      </span>
                    </div>
                  </div>

                  <p className="post-text">{post.content || post.text}</p>

                  <div className="post-actions">
                    <button className="like-btn">👍 Like</button>
                    <span className="like-count">
                      {post.likes?.length || post.likesCount || 0}
                    </span>
                  </div>

                  <div className="comments-section">
                    <div className="comments-list">
                      {post.comments?.length > 0 ? (
                        post.comments.map((comment, index) => (
                          <p key={index}>
                            {comment.user?.username || "User"}:{" "}
                            {comment.content || comment.text}
                          </p>
                        ))
                      ) : (
                        <p>No comments yet</p>
                      )}
                    </div>

                    <input
                      className="comment-input"
                      placeholder="Write a comment..."
                    />
                  </div>
                </article>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}