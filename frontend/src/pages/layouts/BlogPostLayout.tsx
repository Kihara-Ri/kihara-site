import React from "react";
import { Outlet } from "react-router-dom";
import styles from './BlogsLayout.module.css';

const BlogPostLayout: React.FC = () => {
  return (
    <div className={styles.postShell}>
      <Outlet />
    </div>
  )
}

export default BlogPostLayout;
