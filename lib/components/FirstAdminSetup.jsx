import { useState, useEffect } from "react";
import { checkNeedsAdminSetup } from "../lib/auth/setupCheck.js";
import { signUpAdmin } from "../lib/auth/supabaseAuth.js";

export default function FirstAdminSetup({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Pehli dafa check
  useEffect(() => {
    async function check() {
      const needs = await checkNeedsAdminSetup();
      setNeedsSetup(needs);
      setLoading(false);
    }
    check();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    const res = await signUpAdmin({
      email: "alvin@gmail.com",
      password,
      name: "alvindesk",
    });

    setLoading(false);

    if (!res.ok) {
      setError("❌ " + res.error);
      return;
    }

    alert("✅ First Admin Created!");
    if (onComplete) onComplete();
  }

  if (loading) return <div>⏳ Loading...</div>;
  if (!needsSetup) return null; // agar setup already done

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
      <h2>👑 First Admin Setup</h2>
      <p>Create password for <b>alvin@gmail.com</b></p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password 🔑"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: "100%", margin: "5px 0" }}
        />
        <input
          type="password"
          placeholder="Confirm Password 🔒"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={{ width: "100%", margin: "5px 0" }}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>{loading ? "⏳ Creating..." : "Create Admin ✅"}</button>
      </form>
    </div>
  );
}
