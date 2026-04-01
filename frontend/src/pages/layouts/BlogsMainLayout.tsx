// 所有 blog 页面的骨架

import React from "react";
import { Outlet } from "react-router-dom";
import '@/assets/styles/blog.css';

import Levitation from "@/components/Levitation";

const BlogsMainLayout: React.FC = () => {
  return (
    <div className="main-container blogs-page">
      <Levitation />
      <Outlet />
    </div>
  );
};

export default BlogsMainLayout;
