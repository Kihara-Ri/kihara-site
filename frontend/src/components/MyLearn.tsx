// 记录学习进度的组件

import React from "react";
// * 这种导入的方法有什么好处
import styles from '../assets/styles/learning.module.css';

interface LearningItem {
  name: string;
  score: number;
  color?: string;
}
interface LearningProps {
  items: LearningItem[];
}

const clamp = (value: number, min = 0, max = 100) => 
  Number(Math.min(Math.max(value, min), max).toFixed(1));

// 生成渐变色，从主色到较暗的颜色
function makeGradient(color?: string): string {
  if (!color) {
    // 默认蓝色渐变
    return 'linear-gradient(to right, #60a5fa, #2563eb)';
  }
  return `linear-gradient(to right, ${color}, ${color}cc)`; // 后缀 'cc' = 80% 透明
}

const MyLearn: React.FC<LearningProps> = ({ items }) => (
  <div className={styles.learningContainer}>
    <h2>我正在学习:</h2>
    {items.map(({ name, score, color }) => {
      const safeScore = clamp(score);

      return (
        <div key={name} className={styles.item}>
          <div className={styles.label}>
            <span>{name}</span>
            <span>{safeScore}%</span>
          </div>

          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeScore}
            aria-label={`${name} 学习进度 ${safeScore}%`}
          >
            <div
              className={styles.fill}
              style={{
                width: `${safeScore}%`,
                background: makeGradient(color),
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);


export default MyLearn;