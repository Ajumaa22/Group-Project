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
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    loadPosts();
    loadUsers();
    loadFollowing(parsedUser.id);
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
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  }

  async function loadFollowing(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      const ids = data.following?.map((f) => f.following?.id) || [];
      setFollowingIds(ids);
    } catch (error) {
      console.error("Error fetching following:", error);
      setFollowingIds([]);
    }
  }

  const filteredUsers = users.filter((u) => {
    const name = String(u.username || u.name || u.email || "");
    return (
      Number(u.id) !== Number(currentUser?.id) &&
      name.toLowerCase().includes(searchText.trim().toLowerCase())
    );
  });

  const username =
    currentUser?.username || currentUser?.name || currentUser?.email || "User";
  async function handleComment(postId, content) {
    if (!currentUser?.id || !content.trim()) return;

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        postId,
        content,
      }),
    });

    if (response.ok) {
      loadPosts();
    } else {
      alert("Comment failed");
    }
  }
  return (
    <div className="page-shell">
      <header id="navbar">
        <div className="nav-left">
          <h2 id="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
            Momenta
          </h2>
        </div>

        <div className="nav-center" style={{ position: "relative", zIndex: 999999 }}>
          <input
            type="search"
            id="searchInput"
            placeholder="Search users..."
            autoComplete="off"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {searchText.trim() !== "" && (
            <div
              id="searchResults"
              style={{
                position: "absolute",
                top: "45px",
                left: "0",
                width: "280px",
                background: "white",
                color: "black",
                borderRadius: "12px",
                padding: "10px",
                zIndex: 999999,
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              }}
            >
              {filteredUsers.length === 0 ? (
                <p style={{ margin: 0, color: "#777" }}>No users found</p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onMouseDown={() => router.push(`/profile/${u.id}`)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontWeight: "600",
                    }}
                  >
                    {u.username || u.name || u.email}
                  </div>
                ))
              )}
            </div>
          )}
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
              {users.filter((u) => followingIds.includes(u.id)).length === 0 ? (
                <li className="following-empty">Not following anyone yet</li>
              ) : (
                users
                  .filter((u) => followingIds.includes(u.id))
                  .map((u) => (
                    <li key={u.id} className="following-item">
                      <Link href={`/profile/${u.id}`}>
                        {u.username || u.name || u.email}
                      </Link>
                    </li>
                  ))
              )}
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
                      src={post.user?.avatar || "/Icons/user-round (1).svg"}
                      className="profile-img"
                      alt="profile"
                    />

                    <div className="user-info">
                      <Link  href={`/profile/${post.user?.id}`}>
                        <span className="username">
                          {post.user?.username ||
                            post.author?.username ||
                            post.username ||
                            "Unknown"}
                        </span>
                      </Link>

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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleComment(post.id, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
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