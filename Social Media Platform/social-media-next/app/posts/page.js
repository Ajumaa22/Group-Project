"use client";

import "./posts.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PostsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(storedUser));
    loadPosts();
  }, [router]);

  function handleLogoClick() {
    if (pathname === "/") {
      window.location.reload();
    } else {
      router.push("/");
    }
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  async function loadPosts() {
    try {
      const response = await fetch("/api/posts");
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.log("API did not return JSON:", text);
        setPosts([]);
        return;
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  }

  const username =
    currentUser?.username || currentUser?.name || currentUser?.email || "User";

  return (
    <div className="page-shell">
      <header id="navbar">
        <div className="nav-left">
          <h2 id="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
            Momenta
          </h2>
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
              <li>
                <Link href="/" className="nav-item">
                  <div className="nav-icon">🏠</div>
                  <span>Home</span>
                </Link>
              </li>
              <li>
              <Link href="/profile" className="nav-item">
                <div className="nav-icon">👤</div>
                <span>Profile</span>
              </Link>
              </li>
              <li className="nav-item active">
                <div className="nav-icon">📝</div>
                <span>Posts</span>
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
                {/* <span>{users.filter((u) => u.id !== user?.id)
                      .map((u) => (
                        <li key={u.id} className="following-item">
                          <span>{u.username}</span>
                        </li>
                      ))}
                </span> */}
              </li>
            </ul>
          </div>
        </aside>

        <main id="feed">
          <section id="postsContainer">
            {posts.length === 0 ? (
              <p className="no-posts-msg">
                No posts available yet. Posts will appear here after the
                database is seeded.
              </p>
            ) : (
              posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-header">
                    <img
                      src="/Icons/user-round (1).svg"
                      className="profile-img"
                      alt="profile"
                    />

                    <div className="user-info">
                      <span className="username">
                        {post.user?.username ||
                          post.author?.username ||
                          post.username ||
                          "Unknown"}
                      </span>

                      <span className="post-time">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : "Unknown date"}
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
                            {comment.user?.username || "User"}:{": "}
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