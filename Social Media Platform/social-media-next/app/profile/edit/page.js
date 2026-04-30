"use client";

import "../profile.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setUsername(parsedUser.username || "");
    setBio(parsedUser.bio || "");
    setAvatar(parsedUser.avatar || "");
  }, [router]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!user?.id) return;

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        bio,
        avatar,
      }),
    });

    if (response.ok) {
      const updatedUser = await response.json();

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      router.push("/profile");
    } else {
      alert("Profile update failed");
    }
  }

  if (!user) return null;

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <Link href="/">Home</Link>
        <Link href="/profile">Profile</Link>
      </nav>

      <main className="profile-main">
        <section className="profile-card">
          <header className="profile-box">
            <h1>Edit Profile</h1>

            <form className="edit-profile-form" onSubmit={handleSave}>
              <div className="edit-avatar-preview">
                <img src={avatar || "/Icons/user-round (1).svg"} alt="profile" />
              </div>

              <label>Username</label>
              <input
                type="text"
                value={username}
                placeholder="Enter username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Bio</label>
              <textarea
                value={bio}
                maxLength={300}
                placeholder="Say something about yourself"
                onChange={(e) => setBio(e.target.value)}
              />

              <label>Profile Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />

              <button type="submit" className="save-profile-btn">
                Save Changes
              </button>
            </form>
          </header>
        </section>
      </main>
    </div>
  );
}