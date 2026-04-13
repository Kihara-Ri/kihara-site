import { Link } from 'react-router-dom';
import React from 'react';
import { BlogCategoryKey, blogCategoryMap } from '../../types/posts-data';
import styles from './PostCard.module.css';

export interface PostInfo {
  id: string;
  title: string;
  cdate: string;          // 创建时间 ISO 字符串
  mdate: string;          // 修改时间
  category: BlogCategoryKey;
  tags: string[];
  abstract: string;
  hero?: boolean;         // “得意之作”标记
}


const PostCard: React.FC<PostInfo> = ( post: PostInfo ) => {
  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <h3 className={styles.title}><Link to={`/blogs/${post.id}`}>{post.title}</Link></h3>
        <p className={styles.abstract}>{post.abstract}</p>
      </div>
      <div className={styles.meta}>
        <p className={styles.category}>
          {blogCategoryMap[post.category].label} 
        </p>
        <div className={styles.tags}>{
          post.tags.map( tag => (
            <li key={tag} className={styles.tag}>#{tag}</li>
          ))
        }
        </div>
        <time>{post.cdate}</time>
      </div>
    </article>
  )
}

export default PostCard;
