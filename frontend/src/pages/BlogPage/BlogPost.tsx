// blog 单篇文章页

import React from "react";
import { useParams } from "react-router-dom";

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // 使用 slug 去 fetch MDX/Markdown --> 渲染
  return (
    <article>
      <div className="info-container">
        <p>加上AI摘要</p>
        <p>以及一些元数据</p>
      </div>
       文章详情: {slug}
    </article>
  )
}

export default BlogPost;