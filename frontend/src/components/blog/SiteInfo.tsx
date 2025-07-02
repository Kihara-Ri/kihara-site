import React from "react";

const SiteInfo: React.FC = () => {
  return (
    <section className="site-info">
      <h3>站点信息</h3>
      <ul className="site-info">
        <li>文章总数: 42</li>
        <li>全站总字数: 25万</li>
        <li>运行天数: 120</li>
        <li>最近更新: 2025-06-28</li>
      </ul>
    </section>
  )
}

export default SiteInfo;