import React from "react";
import { Outlet } from "react-router-dom";
import styles from './BlogsLayout.module.css';

const TagOnlyLayout: React.FC = () => {
  return (
    <main className={styles.mainColumn}>
      <Outlet />
    </main>
  )
}

export default TagOnlyLayout;
