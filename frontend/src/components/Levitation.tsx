import { blogCategories } from "../types/posts-data";
import styles from './Levitation.module.css';

const Levitation: React.FC = () => {
  return (
    <aside className={styles.bar}>
      <ul className={styles.categories}>
        {blogCategories.map(cat => (
          <li key={cat.key} className={styles.category}>
            {cat.icon} {cat.label}
          </li>
        ))}
      </ul>
      <div className={styles.search}>
        <input type="text" />
        <button>🔍</button>
      </div>
    </aside>
  )
}

export default Levitation;
