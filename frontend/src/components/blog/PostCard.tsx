import { Link } from 'react-router-dom';
import '../../assets/styles/post-card.css';
import '../../assets/styles/tags.css';
import React from 'react';
import { BlogCategoryKey, blogCategoryMap } from '../../types/posts-data';

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
    <article className="post-card">
      <h3 className="post-title"><Link to={`/blogs/${post.id}`}>{post.title}</Link></h3>
      <p className="abstract">{post.abstract}</p>
      <div className="meta">
        <p className="category">
          {blogCategoryMap[post.category].label} 
        </p>
        <div className="post-tags">{
          post.tags.map( tag => (
            <li key={tag} className='post-tag'>#{tag}</li>
          ))
        }
        </div>
        <time>{post.cdate}</time>
      </div>
    </article>
  )
}

export default PostCard;
