import React from 'react';
import '../assets/styles/footer.css';
import react_icon from '/icons/react.svg';
import github from '/icons/github.svg';
import bilibili from '/icons/bilibili.svg';
import QQ from '/icons/QQ.svg';

const Footer: React.FC = () => {

  return (
    <footer className="footer">
      <div className="copy-right">
        <p>Copyright © 2024-2025 Kihara Ri</p>
        <p>Made with{' '}
          <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="react-link">
          <img src={react_icon} alt="React logo" className="react-icon" /> React </a></p>
        <p>ver1.0.0</p>
      </div>
      <div className="center-info">
        本网站仍在开发中
        </div>
      <div className="footer-container">
        <a href="https://github.com/Kihara-Ri/SP_React_site" target="_blank" rel="noopener noreferrer">
        <img src={github} alt="GitHub logo" className="footer-icon" /></a>
        <a href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=ELMIzibXwJ9f6NJsHV-YWhKdxR71msIi&authKey=CwJ3FopgAxUucg3OlyAqP4EYiKfRsFkzOdYnO7gyiutiglBjL0HcVcMU38mddlk0&noverify=0&group_code=750301419" target="_blank" rel="noopener noreferrer">
        <img src={QQ} alt="QQ logo" className="footer-icon" /></a>
        <a href="https://space.bilibili.com/631081975" target="_blank" rel="noopener noreferrer">
        <img src={bilibili} alt="logo" className="footer-icon" /></a>
      </div>
    </footer>
  )
}

export default Footer;