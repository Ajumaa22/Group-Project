import Link from "next/link";

export default function PostsPage() {
  return (
    <div>
      <header id="navbar">
        <div className="nav-left">
          <h2 id="logo">Momenta</h2>
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
          <span id="navUsername">Guest User</span>
          <button id="logout-Btn">Logout</button>
        </div>
      </header>

      <div id="layout">
        <aside id="sidebar">
          <nav id="mainNav">
            <ul>
              <li className="nav-item active" id="homeNav">
                <div className="nav-icon">🏠</div>
                <span>Home</span>
              </li>

              <li className="nav-item" id="postsNav">
                <div className="nav-icon">📝</div>
                <Link href="/posts">Posts</Link>
              </li>

              <li className="nav-item" id="statsNav">
                <div className="nav-icon">📊</div>
                <Link href="/stats">Stats</Link>
              </li>
            </ul>
          </nav>

        </aside>

        <main id="feed">
          <section id="createPost">
            <textarea
              id="postInput"
              placeholder="What's on your mind?"
            ></textarea>
            <button id="submitPostBtn">Post</button>
          </section>

          <section id="postsContainer">
            <article className="post-card">
              <div className="post-header">
                <img className="profile-img" src="/vercel.svg" alt="profile" />
                <div className="user-info">
                  <span className="username">john</span>
                  <span className="post-time">2 hours ago</span>
                </div>
              </div>

              <p className="post-text">Welcome to Momenta Phase 2.</p>

              <div className="post-actions">
                <button className="like-btn">👍 Like</button>
                <span className="like-count">25</span>
              </div>

              <div className="comments-section">
                <div className="comments-list">
                  <p>Nice post!</p>
                </div>
                <input
                  className="comment-input"
                  placeholder="Write a comment..."
                />
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}