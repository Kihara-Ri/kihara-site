import { blogCategories } from "../types/posts-data";
import '../assets/styles/levitation.css';

const Levitation: React.FC = () => {
  return (
    <aside className="levitation">
      <ul className="categories-list">
        {blogCategories.map(cat => (
          <li key={cat.key} className="category-item">
            {cat.icon} {cat.label}
          </li>
        ))}
      </ul>
      <div className="search">
        <input type="text" />
        <button>🔍</button>
      </div>
    </aside>
  )
}

export default Levitation;