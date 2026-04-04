import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BlogHomePage } from "@/features/blog/pages/BlogHomePage";

const BlogHome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag') ?? '';

  const handleSelectTag = (tag: string) => {
    if (tag) {
      setSearchParams({ tag });
      return;
    }
    setSearchParams({});
  };

  return (
    <BlogHomePage
      selectedTag={selectedTag}
      onSelectTag={handleSelectTag}
      onOpenArticle={(slug) => navigate(`/blogs/${slug}`)}
    />
  )
}

export default BlogHome;
