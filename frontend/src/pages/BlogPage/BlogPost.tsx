// blog 单篇文章页

import React from "react";
import { useParams } from "react-router-dom";
import layout from '../layouts/BlogsLayout.module.css';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // 使用 slug 去 fetch MDX/Markdown --> 渲染
  return (
    <article>
      <div className={layout.infoGrid}>
        <p>这里会放文章元数据</p>
      </div>
       文章详情: {slug}
    </article>
  )
}

export default BlogPost;
