import React from "react";
import { Outlet } from "react-router-dom";
import styles from './BlogsLayout.module.css';

const TagOnlyLayout: React.FC = () => {
  return (
    <div className={styles.blogShell}>
      <Outlet />
    </div>
  )
}

export default TagOnlyLayout;
