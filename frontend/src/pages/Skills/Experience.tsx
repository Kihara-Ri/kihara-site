import React from "react";
import { Link } from "react-router-dom";
import styles from '../SectionLayout.module.css';

const SkillsExperience: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Experience</h2>
      <p>当前展示的项目。</p>

      <div className={styles.list}>
        <Link className={styles.projectLink} to="/projects/second-person-novel">
          <h3 className={styles.cardTitle}>二人称小说</h3>
          <p>DEV 目录下的双语阅读项目，已作为站内独立页面接入，支持分组浏览、搜索和词条提示。</p>
          <span className={styles.projectMeta}>点击进入项目页面</span>
        </Link>
      </div>
    </div>
  );
};

export default SkillsExperience;
