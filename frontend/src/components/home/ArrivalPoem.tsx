import { getArrivalPoem } from '../../utils/poems';
import styles from './ArrivalPoem.module.css';

interface ArrivalPoemProps {
  countryName: string;
  distance: number;
  visitCount?: number;
}

const ArrivalPoem: React.FC<ArrivalPoemProps> = ({ countryName, distance, visitCount = 0 }) => {
  const poem = getArrivalPoem(countryName, distance, visitCount);

  return (
    <figure className={styles.poemPanel}>
      <blockquote className={styles.poemText}>
        {[...poem.lines].reverse().map((line) => (
          <span key={line} className={styles.poemLine}>{line}</span>
        ))}
      </blockquote>
      <figcaption className={styles.poemMeta}>《{poem.title}》 {poem.author}</figcaption>
    </figure>
  );
};

export default ArrivalPoem;
