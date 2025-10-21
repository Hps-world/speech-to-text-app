import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/*
  🧠 Header.jsx
  -----------------
  - Displays app title and user info
  - Includes logout dropdown
  - Works responsively (mobile + desktop)
*/

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "User";

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="flex items-center justify-between p-4 shadow-md rounded-b-xl"
      style={{
        backgroundColor: "#57564F",
        color: "#F8F3CE",
      }}
    >
      {/* Logo / Title */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <span className="text-2xl">🎙</span>
        <h1 className="text-xl font-semibold">Speech to Text</h1>
      </div>

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 focus:outline-none hover:opacity-90 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#DDDAD0] text-[#57564F] font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{username}</span>
          <svg
            className={`w-4 h-4 transform transition ${
              menuOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-40 bg-[#DDDAD0] text-[#57564F] rounded-lg shadow-lg z-50"
          >
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-[#F8F3CE] rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
