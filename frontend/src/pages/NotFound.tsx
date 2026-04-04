import React from "react";
import { Link } from "react-router-dom";
import layout from '../components/layout/PageLayout.module.css';
import styles from './NotFound.module.css';

interface NotFoundProps {
  title?: string;
  description?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = '这个页面不存在',
  description = '链接可能已经失效，或者这个内容还没有被放到站点里。',
}) => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
      <section className={styles.shell}>
        <div className={styles.head}>
          <span className={styles.emoji} aria-hidden="true">😳</span>
          <p className={styles.code}>404</p>
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.note}>
          <span className={styles.noteLine} aria-hidden="true" />
          <span>路径没有对应内容，但站点本身还在正常工作。</span>
        </div>
        <div className={styles.actions}>
          <Link to="/" className={styles.primaryAction}>返回首页</Link>
          <Link to="/blogs/" className={styles.secondaryAction}>去博客看看</Link>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
