import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

 async function handleLogin(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(data));
  router.push("/posts");
}

  return (
    <main className="auth-page">
      <section className="auth-card">
        
        <div className="logo">
          <img src="/Icons/IMG_0999.PNG" alt="Momenta logo" />
        </div>

        <div className="title-row">
            <h2>Login</h2>
            <Link href="/register">
                <h1>Register</h1>
            </Link>
        </div>

        <form onSubmit={handleLogin}>
          
          <label>Email</label>
          <div className="input-box">
            <img src="/Icons/mail.svg" alt="" />
            <input name="email" type="email" id="loginEmail" required />
          </div>

          <label>Password</label>
          <div className="input-box">
            <img src="/Icons/lock-keyhole.svg" alt="" />
            <input name="password" type="password" id="loginPassword" required />
          </div>

          <button type="submit">Login</button>
        </form>

        <p className="login-link">
          Dont have an account? <Link href="/register">Register</Link>
        </p>

      </section>
    </main>
  );
}