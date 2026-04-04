import React from 'react';
import react_icon from '/icons/react.svg';
import three_icon from '/icons/threejs.svg';
import github from '/icons/github.svg';
import wechat from '/icons/wechat.svg';
import styles from './Footer.module.css';

const Footer: React.FC = () => {

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.copyRight}>
          <p>Copyright © 2024-2026 Kihara Ri</p>
          <p>Made with{' '}
            <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className={`${styles.techLink} ${styles.reactLink}`}>
            <img src={react_icon} alt="React logo" className={styles.techIcon} /> React </a>
          </p>
          <p>Powered by{' '}
            <a href="https://threejs.org/" target="_blank" rel="noopener noreferrer" className={`${styles.techLink} ${styles.threeLink}`}>
            <img src={three_icon} alt="Three.js logo" className={`${styles.techIcon} ${styles.threeIcon}`} /> Three.js </a>
          </p>
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
