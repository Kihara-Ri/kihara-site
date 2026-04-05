import React from "react";
import { Link } from "react-router-dom";
import layout from '../components/layout/PageLayout.module.css';
import styles from './NotFound.module.css';

interface NotFoundProps {
  title?: string;
  description?: string;
  code?: string;
  note?: string;
  primaryActionLabel?: string;
  primaryActionTo?: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = '这个页面不存在',
  description = '链接可能已经失效，或者这个内容还没有被放到站点里。',
  code = '404',
  note = '路径没有对应内容，但站点本身还在正常工作。',
  primaryActionLabel = '返回首页',
  primaryActionTo = '/',
  secondaryActionLabel = '去博客看看',
  secondaryActionTo = '/blogs/',
}) => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
      <section className={styles.shell}>
        <div className={styles.head}>
          <span className={styles.emoji} aria-hidden="true">😳</span>
          <p className={styles.code}>{code}</p>
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.note}>
          <span className={styles.noteLine} aria-hidden="true" />
          <span>{note}</span>
        </div>
        <div className={styles.actions}>
          <Link to={primaryActionTo} className={styles.primaryAction}>{primaryActionLabel}</Link>
          {secondaryActionLabel && secondaryActionTo ? (
            <Link to={secondaryActionTo} className={styles.secondaryAction}>{secondaryActionLabel}</Link>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default NotFound;
