/**
 * This is a placeholder for navigation.
 * You can integrate it with router of your choice.
 */
import React from "react";

export default function Nav() {
  return (
    <nav>
      <div className="logo">App</div>
      <div className="links">
        <a href="/home" className="nav-link">
          Home
        </a>
        <a href="/about" className="nav-link">
          About
        </a>
        {/* Your routes can go here */}
      </div>
    </nav>
  );
}
