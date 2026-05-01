import { useEffect, useState } from "react";
import { mockStats } from "../data/mockStats";

export default function StatsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Stats API not ready");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch(() => {
        console.log("Using mock stats until /api/stats is ready");
        setStats(mockStats);
      });
  }, []);

  const username = currentUser?.username || currentUser?.name || "User";

  const totalEngagement = stats.totalEngagementPerUser?.reduce(
    (sum, user) => sum + user.totalEngagement,
    0
  );

  return (
    <div className="page-shell">
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
        </div>

        <div className="nav-right">
          <span id="navUsername">{username}</span>
          <button id="logout-Btn">Logout</button>
        </div>
      </header>

      <section className="stats-page">
        <div className="stats-header">
          <h1>Statistics Dashboard</h1>
          <p>Welcome, {username}. Here is an overview of platform activity.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Average Followers</h3>
            <p className="stat-value">{stats.avgFollowersPerUser}</p>
            <p className="stat-subtext">Average followers per user</p>
          </div>

          <div className="stat-card">
            <h3>Average Posts</h3>
            <p className="stat-value">{stats.avgPostsPerUser}</p>
            <p className="stat-subtext">Average posts per user</p>
          </div>

          <div className="stat-card">
            <h3>Most Active User</h3>
            <p className="stat-value">
              {stats.mostActiveUserLast3Months?.username}
            </p>
            <p className="stat-subtext">
              {stats.mostActiveUserLast3Months?.postsCount} posts in the last 3
              months
            </p>
          </div>

          <div className="stat-card">
            <h3>Most Liked Post</h3>
            <p className="stat-value">{stats.mostLikedPost?.likesCount}</p>
            <p className="stat-subtext">
              “{stats.mostLikedPost?.content}” by{" "}
              {stats.mostLikedPost?.authorUsername}
            </p>
          </div>

          <div className="stat-card">
            <h3>Most Commented Post</h3>
            <p className="stat-value">
              {stats.mostCommentedPost?.commentsCount}
            </p>
            <p className="stat-subtext">
              “{stats.mostCommentedPost?.content}” by{" "}
              {stats.mostCommentedPost?.authorUsername}
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Engagement</h3>
            <p className="stat-value">{totalEngagement}</p>
            <p className="stat-subtext">Likes + comments across users</p>
          </div>
        </div>

        <div className="stats-table-wrap">
          <h2>Total Engagement per User</h2>

          <table className="stats-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Total Engagement</th>
              </tr>
            </thead>

            <tbody>
              {stats.totalEngagementPerUser?.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.totalEngagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-placeholder">
          <h2>Engagement Chart</h2>
          <p>Chart area prepared for final report screenshot.</p>
        </div>
      </section>
    </div>
  );
}