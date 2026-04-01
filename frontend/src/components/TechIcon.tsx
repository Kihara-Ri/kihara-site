// 将单个科技品牌图标进行装饰包装
import styles from './TechIcon.module.css';

interface TechIconProps {
  icon: string;
  name: string;
}

const TechIcon: React.FC<TechIconProps> = ({ icon, name }) => {
  return (
    <div className={styles.card}>
      <img src={icon} alt={`${name}-logo`} className={styles.icon} />
    </div>
  )
}

export default TechIcon;
