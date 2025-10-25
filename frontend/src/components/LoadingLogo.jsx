import React from "react";

export default function LoadingLogo({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8F3CE] text-[#57564F] transition-all duration-500">
      {/* 🎙 Mic spinner */}
      <div className="relative w-14 h-20 animate-spin-slow">
        {/* Mic head */}
        <div className="absolute top-0 left-[6px] w-10 h-10 rounded-full bg-[#57564F]" />
        {/* Mic body */}
        <div className="absolute top-10 left-[14px] w-6 h-6 rounded-lg bg-[#7A7A73]" />
        {/* Mic stand */}
        <div className="absolute bottom-0 left-[22px] w-2 h-5 rounded-sm bg-[#57564F]" />
      </div>

      {/* Loading text */}
      <p className="mt-6 text-[#7A7A73] text-lg tracking-wide animate-pulse">
        {text}
      </p>
    </div>
  );
}
