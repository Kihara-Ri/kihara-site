// 将单个科技品牌图标进行装饰包装
import '../assets/styles/tech-icon.css';

interface TechIconProps {
  icon: string;
  name: string;
}

const TechIcon: React.FC<TechIconProps> = ({ icon, name }) => {
  return (
    <div className="tech-card">
      <img src={icon} alt={`${name}-logo`} className="tech-icon" />
    </div>
  )
}

export default TechIcon;