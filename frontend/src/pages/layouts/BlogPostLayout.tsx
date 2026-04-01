import React from "react";
import { Outlet } from "react-router-dom";

const BlogPostLayout: React.FC = () => {
  return (
    <div className="main-column">
      <Outlet />
    </div>
  )
}

export default BlogPostLayout;
