import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const username = user?.username || user?.name || "User";

  function handleLogout() {
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  return (
    <div className="page-shell">
      {/* NAVBAR */}
      <header id="navbar">
        <div className="nav-left">
          <h2 id="logo">Momenta</h2>
        </div>

        <div className="nav-center">
          <input
            type="search"
            id="searchInput"
            placeholder="Search users..."
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

      {/* MAIN LAYOUT */}
      <div id="layout">
        {/* SIDEBAR */}
        <aside id="sidebar">
          <nav id="mainNav">
            <ul>
              <li className="nav-item active">
                <div className="nav-icon">🏠</div>
                <span>Home</span>
              </li>

              <li className="nav-item">
                <div className="nav-icon">📝</div>
                <Link href="/posts">Posts</Link>
              </li>

              <li className="nav-item">
                <div className="nav-icon">📊</div>
                <Link href="/stats">Stats</Link>
              </li>
            </ul>
          </nav>

          <div id="followingSection">
            <h4>Following</h4>
            <ul id="followingList">
              <li className="following-item">
                <img
                  src="/vercel.svg"
                  className="following-img"
                  alt="profile"
                />
                <span>Suggested User</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* FEED */}
        <main id="feed">
          <section id="createPost">
            <textarea
              id="postInput"
              placeholder="What's on your mind?"
            ></textarea>
            <button id="submitPostBtn">Post</button>
          </section>

          <section id="postsContainer">
            <div className="post-card">
              <div className="post-header">
                <img
                  className="profile-img"
                  src="/vercel.svg"
                  alt="profile"
                />
                <div className="user-info">
                  <span className="username">{username}</span>
                  <span className="post-time">Now</span>
                </div>
              </div>

              <p className="post-text">
                This is your feed. Posts will appear here once the backend is
                connected.
              </p>

              <div className="post-actions">
                <button className="like-btn">👍 Like</button>
                <span className="like-count">0</span>
              </div>

              <div className="comments-section">
                <div className="comments-list">
                  <p>No comments yet</p>
                </div>
                <input
                  className="comment-input"
                  placeholder="Write a comment..."
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}