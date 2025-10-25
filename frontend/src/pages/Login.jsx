import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingLogo from "../components/LoadingLogo";

/*
  🎯 Login.jsx
  ------------
  - Handles user authentication
  - Uses LoadingLogo during API call
  - Stores JWT token + user info in localStorage
  - Redirects to Dashboard after success
*/

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      // ✅ Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.name, email: data.email })
      );

      // 🧠 Preload dashboard data for faster UX
      await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transcripts`),
        new Promise((res) => setTimeout(res, 400)),
      ]);

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎙 Show loading spinner during login
  if (loading) return <LoadingLogo text="Authenticating..." />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#DDDAD0] text-[#57564F]">
      <div className="bg-[#F8F3CE] shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6">
          🎙 Speech to Text Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-md p-2 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="border border-[#7A7A73] rounded-lg p-3 bg-[#DDDAD0] placeholder:text-[#7A7A73] focus:outline-none focus:ring-2 focus:ring-[#7A7A73]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="border border-[#7A7A73] rounded-lg p-3 bg-[#DDDAD0] placeholder:text-[#7A7A73] focus:outline-none focus:ring-2 focus:ring-[#7A7A73]"
          />

          <button
            type="submit"
            className="mt-3 bg-[#57564F] text-[#F8F3CE] py-2 rounded-lg text-lg font-medium hover:bg-[#7A7A73] transition-all duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-[#7A7A73]">
          Don’t have an account?{" "}
          <span
            className="text-[#57564F] font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
