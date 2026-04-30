"use client";

import "../profile.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    loadUser(id);
    loadPosts(id);
  }, [id]);

  async function loadUser(userId) {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      const found = data.find((u) => u.id == userId);
      setTargetUser(found);
    } catch {
      setTargetUser(null);
    }
  }

  async function loadPosts(userId) {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();

      const userPosts = data.filter(
        (p) => p.user?.id == userId || p.userId == userId
      );

      setPosts(userPosts);
    } catch {
      setPosts([]);
    }
  }

  if (!targetUser) {
    return <p style={{ padding: "20px" }}>Loading profile...</p>;
    }

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <Link href="/">← Back to Feed</Link>
      </nav>

      <main className="profile-main">
        <section className="profile-card">
          <header className="profile-box">
            <div className="profile-header">
              <div className="profile-pic">
                <img
                  src={targetUser.avatar || "/Icons/user-round (1).svg"}
                  alt="profile"
                />
              </div>

              <div className="profile-info">
                <h1>{targetUser.username}</h1>
                <p>{targetUser.bio || "No bio yet"}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-n">
                <h2>{posts.length}</h2>
                <p>Posts</p>
              </div>

              <div className="stat-divider"></div>

              <div className="profile-n">
                <h2>{targetUser.followers?.length || 0}</h2>
                <p>Followers</p>
              </div>

              <div className="stat-divider"></div>

              <div className="profile-n">
                <h2>{targetUser.following?.length || 0}</h2>
                <p>Following</p>
              </div>
            </div>

            {currentUser?.id !== targetUser.id && (
              <button className="follow-btn">
                Follow
              </button>
            )}
          </header>
        </section>

        <section id="postsContainer">
          {posts.length === 0 ? (
            <p className="no-posts-msg">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <article className="post-card" key={post.id}>
                <p>
                  <strong>{targetUser.username}</strong>
                </p>

                <p>{post.content}</p>

                <small>
                  {new Date(post.createdAt).toLocaleString()}
                </small>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}