import React, { useMemo } from "react";
import { posts } from "../../types/posts-data";
import { useNavigate } from "react-router-dom";
import styles from './TagsGrid.module.css';

const TagsGrid: React.FC = () => {
  const navigate = useNavigate();

  // 取出所有标签 -> 去重 -> 排序
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap( post => post.tags))).sort(),
    []
  );
  
  return (
    <ul className={styles.grid}>
      {tags.map(tag => (
        <li
          key={tag}
          className={styles.tag}
          onClick={() => navigate(`/blogs/tag/${encodeURIComponent(tag)}`)}
        >
          #{tag}
        </li>
      ))}
    </ul>
  )
}

export default TagsGrid;
