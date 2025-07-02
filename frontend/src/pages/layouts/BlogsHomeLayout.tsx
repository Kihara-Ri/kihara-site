import ArchiveNav from "@/components/blog/ArchiveNav";
import CategoryNav from "@/components/blog/CategoryNav";
import SiteInfo from "@/components/blog/SiteInfo";
import TagsGrid from "@/components/blog/TagsGrid";
import React from "react";
import { Outlet } from "react-router-dom";

const BlogsHomeLayout: React.FC = () => {
  return (
    <>
      <aside className="sidebar-left"><CategoryNav /></aside>

      <main className="main-column">
        {/* 渲染主要展示内容 */}
        <Outlet />
      </main>

      <aside className="sidebar-right">
        <section>
          <TagsGrid />
        </section>
        <section>
          <ArchiveNav />
        </section>
        <section>
          <SiteInfo />
        </section>
      </aside>
    </>
  )
}

export default BlogsHomeLayout;