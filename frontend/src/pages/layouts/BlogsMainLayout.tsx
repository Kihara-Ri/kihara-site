// 所有 blog 页面的骨架

import React from "react";
import { Outlet } from "react-router-dom";
import pageLayout from '@/components/layout/PageLayout.module.css';
import styles from './BlogsLayout.module.css';

const BlogsMainLayout: React.FC = () => {
  return (
    <div className={[pageLayout.page, pageLayout.main, pageLayout.mainStretch, styles.page].join(' ')}>
      <Outlet />
    </div>
  );
};

export default BlogsMainLayout;
