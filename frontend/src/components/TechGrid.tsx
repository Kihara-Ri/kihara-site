import TechIcon from "./TechIcon";
import { techList } from "../types/iconData";
import styles from './TechGrid.module.css';

const TechGrid: React.FC = () => {
  return (
    <div className={styles.grid}>
      {techList.map((tech, index) => (
        <TechIcon key={index} icon={tech.icon} name={tech.name} />
      ))}
    </div>
  )
}

export default TechGrid;
