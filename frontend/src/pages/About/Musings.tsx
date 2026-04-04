import React from "react";
import styles from '../SectionLayout.module.css';

const AboutMusings: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Musings</h2>
      <p>这个旧入口会逐步并到 Now。它更像阶段性的念头记录，而不是独立栏目。</p>
      <p className={styles.muted}>如果从旧链接进来，建议之后直接看 About / Now。</p>
    </div>
  )
}

export default AboutMusings;
