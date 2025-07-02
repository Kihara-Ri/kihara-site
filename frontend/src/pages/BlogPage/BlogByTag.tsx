// blog 标签过滤页
// 设计目标：
// 通过标签筛选文章，支持标签多选
// 在每选择一个标签后，自动进行判断筛选后的 blogs 中还有哪些标签
// 无法选择的标签调为灰色


import React from "react";
import { posts } from "../../types/posts-data";
import { useParams } from "react-router-dom";
import PostCard from "../../components/blog/PostCard";

const BlogByTag: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  if (!tag) return null;

  const list = posts.filter(post => post.tags.includes(tag));

  return (
    <main className="main-content">
      <h2>标签: #{tag}</h2>
      {list.length
        ? list.map(post => <PostCard key={post.id} {...post} />)
        : <p>暂无文章</p>
      }
    </main>
  )
}

export default BlogByTag;