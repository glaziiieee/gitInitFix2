// src/components/Logo.js
import React from "react";

const Logo = ({ width = 40, height = 40, className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bow */}
      <path
        d="M50 50 C40 40, 25 35, 20 45 C15 55, 25 60, 35 55 C30 65, 35 75, 50 65
           C65 75, 70 65, 65 55 C75 60, 85 55, 80 45 C75 35, 60 40, 50 50 Z"
        fill="url(#pinkGradient)"
        stroke="#fff"
        strokeWidth="1.5"
      />

      {/* Center knot */}
      <circle cx="50" cy="50" r="6" fill="#f4a9c4" stroke="#fff" strokeWidth="1" />

      {/* Sparkles */}
      <path d="M15 20 L17 24 L15 28 L13 24 Z" fill="#fff8fc" />
      <path d="M85 25 L87 29 L85 33 L83 29 Z" fill="#fff8fc" />
      <path d="M50 15 L52 18 L50 21 L48 18 Z" fill="#fff8fc" />

      {/* Script B */}
      <text
        x="50"
        y="90"
        textAnchor="middle"
        fontSize="20"
        fill="#d63384"
        fontFamily="cursive"
      >
        B
      </text>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="pinkGradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#fbd1dc" />
          <stop offset="100%" stopColor="#f8a1c4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
