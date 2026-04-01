import React from "react";
import layout from '../components/layout/PageLayout.module.css';

const Music: React.FC = () => {
  return (
    <div className={[layout.page, layout.main].join(' ')}>
      <p className={layout.placeholder}>Music 页面正在整理中。</p>
    </div>
  )
}

export default Music;
