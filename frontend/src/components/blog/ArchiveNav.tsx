import React from "react";

const ArchiveNav: React.FC = () => {
  return (
    <nav className="archive-nav">
      <h3>归档</h3>
      <ul>
        <li><a href="/blogs/archive/2025">2025</a></li>
        <li><a href="/blogs/archive/2024">2024</a></li>
      </ul>
    </nav>
  )
}

export default ArchiveNav;