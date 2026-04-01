import ArchiveNav from "@/components/blog/ArchiveNav";
import CategoryNav from "@/components/blog/CategoryNav";
import SiteInfo from "@/components/blog/SiteInfo";
import TagsGrid from "@/components/blog/TagsGrid";
import React from "react";
import { Outlet } from "react-router-dom";
import styles from './BlogsLayout.module.css';

const BlogsHomeLayout: React.FC = () => {
  return (
    <div className={styles.content}>
      <aside className={styles.sidebar}>
        <div className={styles.panel}><CategoryNav /></div>
      </aside>

      <main className={styles.mainColumn}>
        <Outlet />
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.panel}>
          <TagsGrid />
        </section>
        <section className={styles.panel}>
          <ArchiveNav />
        </section>
        <section className={styles.panel}>
          <SiteInfo />
        </section>
      </aside>
    </div>
  )
}

export default BlogsHomeLayout;
