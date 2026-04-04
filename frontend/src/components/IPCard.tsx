import { getArrivalPoem } from '../utils/poems';
import styles from './IPCard.module.css';

interface IPCardProps {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  latitude: number;
  longitude: number;
  visitor_ordinal?: number;
  visit_count?: number;
}

const IPCard: React.FC<IPCardProps> = ({
  ip,
  country_name,
  location,
  distance,
  latitude,
  longitude,
  visitor_ordinal,
  visit_count,
}) => {
  const poem = getArrivalPoem(country_name, distance, visit_count ?? visitor_ordinal ?? 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>这一次抵达</h2>
        </div>
        <div className={styles.distanceBadge}>
          <span className={styles.distanceValue}>{distance.toFixed(0)} km</span>
          <span className={styles.distanceLabel}>Route</span>
        </div>
      </div>

      <div className={styles.primaryGrid}>
        <div className={styles.primaryCard}>
          <span className={styles.label}>Location</span>
          <strong className={styles.value}>{location}</strong>
        </div>
        <div className={styles.primaryCard}>
          <span className={styles.label}>Visitor No.</span>
          <strong className={styles.value}>{visitor_ordinal ? `第 ${visitor_ordinal} 位` : '记录中'}</strong>
        </div>
      </div>

      <div className={styles.secondaryGrid}>
        <div className={styles.secondaryItem}>
          <span className={styles.label}>IP</span>
          <span className={styles.secondaryValue}>{ip}</span>
        </div>
        <div className={styles.secondaryItem}>
          <span className={styles.label}>Coordinates</span>
          <span className={styles.secondaryValue}>{latitude.toFixed(2)}, {longitude.toFixed(2)}</span>
        </div>
        <div className={styles.secondaryItem}>
          <span className={styles.label}>Visits</span>
          <span className={styles.secondaryValue}>{visit_count ? `第 ${visit_count} 次` : '初次抵达'}</span>
        </div>
      </div>

      <div className={styles.poemBlock}>
        <p className={styles.poemLines}>{poem.lines.join(' / ')}</p>
        <p className={styles.poemMeta}>《{poem.title}》 {poem.author}</p>
      </div>
    </div>
  )
}

export default IPCard;
