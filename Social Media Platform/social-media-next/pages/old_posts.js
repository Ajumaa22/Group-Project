import { useEffect, useState } from "react";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);

  // Fetch posts from API
  useEffect(() => {
  fetch("/api/posts")
    .then(async (res) => {
      const text = await res.text();

      try {
        return JSON.parse(text);
      } catch {
        console.log("API did not return JSON:", text);
        return [];
      }
    })
    .then((data) => {
      setPosts(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.error("Error fetching posts:", err);
      setPosts([]);
    });
}, []);

  return (
    <div className="simple-page">
      <h1>Posts</h1>

      <div id="postsContainer">
        {posts.length === 0 && <p>Loading posts...</p>}

        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <img
                src="/profile.jpg"
                className="profile-img"
                alt="profile"
              />

              <div className="user-info">
                <span className="username">
                  {post.user?.username || "Unknown"}
                </span>
                <span className="post-time">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="post-text">{post.content}</p>

            <div className="post-actions">
              <button className="like-btn">Like</button>
              <span className="like-count">
                {post.likes?.length || 0}
              </span>
            </div>

            <div className="comments-section">
              <div className="comments-list">
                {post.comments?.map((c, i) => (
                  <p key={i}>
                    {c.user?.username}: {c.content}
                  </p>
                ))}
              </div>

              <input
                className="comment-input"
                placeholder="Write a comment..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}