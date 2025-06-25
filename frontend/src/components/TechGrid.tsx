import TechIcon from "./TechIcon";
import { techList } from "../types/iconData";

const TechGrid: React.FC = () => {
  return (
    <div className="tech-grid">
      {techList.map((tech, index) => (
        <TechIcon key={index} icon={tech.icon} name={tech.name} />
      ))}
    </div>
  )
}

export default TechGrid;