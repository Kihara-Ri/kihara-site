import TechGrid from "./TechGrid";
import styles from './MySkills.module.css';

const MySkills: React.FC = () => {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>我会什么</h2>
      <TechGrid />
    </div>
  )
}

export default MySkills;
