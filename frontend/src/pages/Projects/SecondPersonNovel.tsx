import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NovelViewerPage } from "@/features/secondPersonNovel/NovelViewerPage";

const SecondPersonNovel: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/projects/second-person-novel/") {
      navigate("/projects/second-person-novel", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const currentPath = "/projects/second-person-novel";

    const handlePopState = () => {
      const nextUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (window.location.pathname !== currentPath) {
        // 部分浏览器环境下地址会先变化，但 React 视图没有及时切换。
        // 这里在离开该页面时强制按目标地址做一次真实导航，避免“URL 变了但页面不动”。
        window.location.replace(nextUrl);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return <NovelViewerPage />;
};

export default SecondPersonNovel;
