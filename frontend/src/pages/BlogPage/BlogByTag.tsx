import React from "react";
import { Navigate, useParams } from "react-router-dom";

const BlogByTag: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();

  if (!tag) {
    return null;
  }

  return <Navigate to={`/blogs?tag=${encodeURIComponent(tag)}`} replace />;
}

export default BlogByTag;
