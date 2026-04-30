"use client";

import "./home.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
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
    setUser(parsedUser);

    loadUsers();
    loadFollowingAndPosts(parsedUser.id);
    setLoading(false);
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

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }

  async function loadFollowingAndPosts(userId) {
    try {
      const userRes = await fetch(`/api/users/${userId}`);
      const userData = await userRes.json();

      const ids =
        userData.following?.map((f) => f.following?.id) || [];

      setFollowingIds(ids);

      const postsRes = await fetch("/api/posts");
      const postsData = await postsRes.json();

      const safePosts = Array.isArray(postsData) ? postsData : [];
      setAllPosts(safePosts);

      const filteredPosts = safePosts.filter(
        (post) => ids.includes(post.user?.id) || post.user?.id === userId
      );

      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error loading feed:", error);
      setPosts([]);
    }
  }

  async function handleCreatePost() {
    if (!postText.trim() || !user?.id) return;

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        content: postText,
      }),
    });

    if (response.ok) {
      setPostText("");
      loadFollowingAndPosts(user.id);
    } else {
      alert("Post could not be created.");
    }
  }

  async function handleDeletePost(postId) {
    if (!confirm("Delete this post?")) return;

    const response = await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
    });

    if (response.ok) {
      loadFollowingAndPosts(user.id);
    } else {
      alert("Delete post failed");
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;

    const response = await fetch("/api/comments", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commentId }),
    });

    if (response.ok) {
      loadFollowingAndPosts(user.id);
    } else {
      alert("Delete comment failed");
    }
  }

  async function handleToggleLike(post) {
    const alreadyLiked = post.likes?.some((like) => like.userId === user.id);

    const response = await fetch("/api/likes", {
      method: alreadyLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        postId: post.id,
      }),
    });

    if (response.ok) {
      loadFollowingAndPosts(user.id);
    }
  }

  async function handleToggleRetweet(post) {
    const alreadyRetweeted = post.retweets?.some(
      (r) => r.userId === user.id
    );

    const response = await fetch("/api/retweets", {
      method: alreadyRetweeted ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        postId: post.id,
      }),
    });

    if (response.ok) {
      loadFollowingAndPosts(user.id);
    }
  }

  async function handleComment(postId, content) {
    if (!content.trim()) return;

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        postId,
        content,
      }),
    });

    if (response.ok) {
      loadFollowingAndPosts(user.id);
    }
  }

  const filteredUsers = users.filter((u) => {
    const name = String(u.username || u.name || u.email || "");
    const currentUserId = Number(user?.id);
    const searchedText = searchText.trim().toLowerCase();

    return Number(u.id) !== currentUserId && name.toLowerCase().includes(searchedText);
  });

  const username = user?.username || "User";

  if (loading) return null;

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
          <div id="searchResults">
            {filteredUsers.length === 0 ? (
              <p className="search-empty">No users found</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="search-result-item"
                  onMouseDown={() => router.push(`/profile/${u.id}`)}
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
              <li className="nav-item active">
                <div className="nav-icon">🏠</div>
                <span>Home</span>
              </li>

              <li>
                <Link href="/profile" className="nav-item">
                  <div className="nav-icon">👤</div>
                  <span>Profile</span>
                </Link>
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
              {users
                .filter((u) => followingIds.includes(u.id))
                .map((u) => (
                  <li key={u.id} className="following-item">
                    <Link href={`/profile/${u.id}`}>{u.username}</Link>
                  </li>
                ))}
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
            />

            <button id="submitPostBtn" onClick={handleCreatePost}>
              Post
            </button>
          </section>

          <section id="postsContainer">
            {posts.length === 0 ? (
              <p className="no-posts-msg">
                Follow users to see their posts here.
              </p>
            ) : (
              posts.map((post) => {
                const isOwnPost = post.user?.id === user?.id;

                return (
                  <article className="post-card" key={post.id}>
                    <div className="post-header">
                      <img
                        className="profile-img"
                        src={post.user?.avatar || "/Icons/user-round (1).svg"}
                        alt="profile"
                      />

                      <div className="user-info">
                        <Link href={`/profile/${post.user?.id}`}>
                          <span className="username">
                            {post.user?.username || username}
                          </span>
                        </Link>

                        <span className="post-time">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : "Just now"}
                        </span>
                      </div>

                      {isOwnPost && (
                        <button
                          className="delete-post-btn"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <p className="post-text">{post.content || post.text}</p>

                    <div className="post-actions">
                      <button
                        className={
                          post.likes?.some((l) => l.userId === user?.id)
                            ? "like-btn liked"
                            : "like-btn"
                        }
                        onClick={() => handleToggleLike(post)}
                      >
                        {post.likes?.some((l) => l.userId === user?.id)
                          ? "👍 Unlike"
                          : "👍 Like"}
                      </button>

                      <span className="like-count">
                        {post._count?.likes || post.likes?.length || 0}
                      </span>

                      <button
                        className={
                          post.retweets?.some((r) => r.userId === user?.id)
                            ? "retweet-btn active"
                            : "retweet-btn"
                        }
                        onClick={() => handleToggleRetweet(post)}
                      >
                        {post.retweets?.some((r) => r.userId === user?.id)
                          ? "🔁 Undo"
                          : "🔁 Retweet"}
                      </button>

                      <span className="retweet-count">
                        {post._count?.retweets || post.retweets?.length || 0}
                      </span>
                    </div>

                    <div className="comments-section">
                      <div className="comments-list">
                        {post.comments?.length > 0 ? (
                          post.comments.map((comment) => (
                            <div className="comment-item" key={comment.id}>
                              <div className="comment-body">
                                <span className="comment-username">
                                  {comment.user?.username || "User"}:
                                </span>

                                <span className="comment-text">
                                  {" "}
                                  {comment.content || comment.text}
                                </span>
                              </div>

                              {comment.user?.id === user?.id && (
                                <button
                                  className="delete-comment-btn"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </div>
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
                );
              })
            )}
          </section>
        </main>
      </div>
    </div>
  );
}