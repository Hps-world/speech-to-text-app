import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingLogo from "../components/LoadingLogo";

/*
  🎯 Signup.jsx
  --------------
  - Registers new user
  - Uses LoadingLogo for feedback
  - Stores JWT + user info locally
  - Redirects instantly to Dashboard
*/

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed. Please try again.");
      }

      // ✅ Store user info & token
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.name, email: data.email })
      );

      // 🚀 Optional prefetch for smooth UX
      await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transcripts`),
        new Promise((res) => setTimeout(res, 400)),
      ]);

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Signup Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎙 Show loading spinner during signup
  if (loading) return <LoadingLogo text="Creating account..." />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#DDDAD0] text-[#57564F]">
      <div className="bg-[#F8F3CE] shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6">
          🪄 Create Your Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-md p-2 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="border border-[#7A7A73] rounded-lg p-3 bg-[#DDDAD0] placeholder:text-[#7A7A73] focus:outline-none focus:ring-2 focus:ring-[#7A7A73]"
          />

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
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-[#7A7A73]">
          Already have an account?{" "}
          <span
            className="text-[#57564F] font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
