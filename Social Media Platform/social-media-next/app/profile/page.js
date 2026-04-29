"use client";

import "./profile.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    loadPosts(parsedUser.id);
  }, [router]);

  async function loadPosts(userId) {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();

      const userPosts = Array.isArray(data)
        ? data.filter((post) => post.user?.id === userId || post.userId === userId)
        : [];

      setPosts(userPosts);
    } catch {
      setPosts([]);
    }
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <Link href="/">Home</Link>

        <div className="nav-right">
          <span className="nav-username">{user.username}</span>
          <button id="logout-Btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="profile-main">
        <section className="profile-card">
          <header className="profile-box">
            <div className="profile-header">
              <div className="profile-pic">
                <img
                  src={user.avatar || "/Icons/user-round (1).svg"}
                  alt="profile"
                />
              </div>

              <div className="profile-info">
                <h1>{user.username}</h1>
                <p>{user.bio || "No bio yet."}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-n">
                <h2>0</h2>
                <p>Followers</p>
              </div>

              <div className="stat-divider"></div>

              <div className="profile-n">
                <h2>0</h2>
                <p>Following</p>
              </div>

              <div className="stat-divider"></div>

              <div className="profile-n">
                <h2>{posts.length}</h2>
                <p>Posts</p>
              </div>
            </div>

            <Link href="/profile/edit">
              <button id="edit-Btn">Edit profile</button>
            </Link>
          </header>
        </section>

        <section id="postsContainer">
          {posts.length === 0 ? (
            <p className="no-posts-msg">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <article className="post-card" key={post.id}>
                <p>
                  <strong>{user.username}</strong>
                </p>
                <p>{post.content || post.text}</p>
                <small>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleString()
                    : "Just now"}
                </small>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}