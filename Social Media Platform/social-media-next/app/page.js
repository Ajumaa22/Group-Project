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

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setLoading(false);
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
    if (!postText.trim() || !user?.id) return;

    try {
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

      const text = await response.text();

      if (!response.ok) {
        console.log("Post API error:", text);
        alert("Post could not be created. Please check the posts API.");
        return;
      }

      let newPost;
      try {
        newPost = JSON.parse(text);
      } catch {
        console.log("Post API did not return JSON:", text);
        return;
      }

      setPosts([newPost, ...posts]);
      setPostText("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while creating the post.");
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
      loadPosts();
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
      loadPosts();
    } else {
      alert("Delete comment failed");
    }
  }

  async function handleToggleLike(post) {
    if (!user?.id) return;

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
      loadPosts();
    } else {
      alert("Like/Unlike failed");
    }
  }

  async function handleToggleRetweet(post) {
  if (!user?.id) return;

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
    loadPosts();
  } else {
    alert("Retweet failed");
  }
}

  async function handleComment(postId, content) {
    if (!user?.id || !content.trim()) return;

    try {
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
        loadPosts();
      } else {
        const errorText = await response.text();
        console.log("Comment API error:", errorText);
        alert("Comment failed. Please check the comments API.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  const username = user?.username || user?.name || user?.email || "User";

  if (loading) return null;

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
            />

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
              posts.map((post) => {
                const isOwnPost = post.user?.id === user?.id;
                const isLiked = post.likes?.some(
                  (like) => like.userId === user?.id
                );

                return (
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

                      {isOwnPost && (
                        <button
                          className="delete-post-btn"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete post"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                    {post.retweets?.some((r) => r.userId === user?.id) &&
                      post.user?.id !== user?.id && (
                        <div className="retweet-label">
                          🔁 You retweeted this
                        </div>
                    )}
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
                                  {comment.user?.username || "User"}
                                </span>
                                <span className="comment-text">
                                  {comment.content || comment.text}
                                </span>
                              </div>

                              {comment.user?.id === user?.id && (
                                <button
                                  className="delete-comment-btn"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  title="Delete comment"
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