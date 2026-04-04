import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BlogArticlePage } from "@/features/blog/pages/BlogArticlePage";

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return null;
  }

  return (
    <BlogArticlePage
      slug={slug}
      onBackHome={() => navigate('/blogs')}
      onSelectTag={(tag) => navigate(`/blogs?tag=${encodeURIComponent(tag)}`)}
    />
  )
}

export default BlogPost;
