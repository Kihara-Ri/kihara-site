import React from 'react';
import react_icon from '/icons/react.svg';
import github from '/icons/github.svg';
import wechat from '/icons/wechat.svg';
import styles from './Footer.module.css';

const Footer: React.FC = () => {

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.copyRight}>
          <p>Copyright © 2024-2025 Kihara Ri</p>
          <p>Made with{' '}
            <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className={styles.reactLink}>
            <img src={react_icon} alt="React logo" className={styles.reactIcon} /> React </a></p>
          <p>ver1.0.0</p>
        </div>
        <div className={styles.centerInfo}>
          DEV
          </div>
        <div className={styles.actions}>
          <a href="https://github.com/Kihara-Ri" target="_blank" rel="noopener noreferrer">
          <img src={github} alt="GitHub logo" className={styles.footerIcon} /></a>
          <div className={styles.wechatWrapper}>
            <img src={wechat} alt="wechat logo" className={styles.footerIcon} />
            <span className={styles.wechatTooltip}>联系我: kihara0045</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
