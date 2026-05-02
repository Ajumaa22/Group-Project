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
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    loadProfile(parsedUser.id, id);
    loadPosts(id);
  }, [id, router]);

  async function loadProfile(currentUserId, targetUserId) {
    try {
      const targetRes = await fetch(`/api/users/${targetUserId}`);
      const targetData = await targetRes.json();
      setTargetUser(targetData);

      const currentRes = await fetch(`/api/users/${currentUserId}`);
      const currentData = await currentRes.json();

      const following = currentData.following || [];

      const alreadyFollowing = following.some(
        (f) => f.following?.id === Number(targetUserId)
      );

      setIsFollowing(alreadyFollowing);
    } catch {
      setTargetUser(null);
    }
  }

  async function loadPosts(userId) {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();

      const userPosts = Array.isArray(data)
        ? data.filter(
            (post) =>
              post.user?.id === Number(userId) ||
              post.userId === Number(userId) ||
              post.retweets?.some((r) => r.userId === Number(userId))
          )
        : [];

      setPosts(userPosts);
    } catch {
      setPosts([]);
    }
  }

async function handleFollowToggle() {
  if (!currentUser || !targetUser) return;

  console.log("FOLLOW TEST:", {
    followerId: currentUser.id,
    followingId: targetUser.id,
    isFollowing,
  });

  const response = await fetch("/api/follow", {
    method: isFollowing ? "DELETE" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      followerId: currentUser.id,
      followingId: targetUser.id,
    }),
  });

  const text = await response.text();
  console.log("FOLLOW RESPONSE:", response.status, text);

  if (response.ok) {
    await loadProfile(currentUser.id, targetUser.id);
  } else {
    alert("Follow/unfollow failed: " + text);
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
              <button
                className={`follow-btn ${isFollowing ? "unfollow" : "follow"}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
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
                {post.retweets?.some((r) => r.userId === Number(targetUser.id)) &&
                  post.user?.id !== Number(targetUser.id) && (
                    <p className="retweet-label">🔁 Retweeted by {targetUser.username}</p>
                )}

                <p>
                  <strong>{post.user?.username || "Unknown"}</strong>
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