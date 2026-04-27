"use client";
import "./style.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();

    const username = e.currentTarget.elements.username.value;
    const email = e.currentTarget.elements.email.value;
    const password = e.currentTarget.elements.password.value;
    const confirmPassword = e.currentTarget.elements.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(data));
    router.push("/login");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo">
          <img src="/icons/IMG_0999.PNG" alt="Momenta logo" />
        </div>

        <div className="title-row">
          <Link href="/login">
            <h1>Login</h1>
          </Link>
          <h2>Register</h2>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
            />

            <label htmlFor="dob">Date of Birth</label>
            <input type="date" id="dob" name="dob" />

            <div className="btn-row">
              <button className="register-btn" type="submit">
                Register
              </button>
              <button className="register-btn" type="reset">
                Reset
              </button>
            </div>
          </div>
        </form>

        <p className="login-link">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}