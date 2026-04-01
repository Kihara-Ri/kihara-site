import { useState } from 'react';
import GlobeScene from "./GlobeScene";
import styles from './IPCard.module.css';

interface IPCardProps {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  // region_name: string;
  latitude: number;
  longitude: number;
  // is_proxy: boolean;
}

const myLocation = { lat: 35.6895, lon: 139.6917 }; // Tokyo

const IPCard: React.FC<IPCardProps> = ({ ip, country_name, location, distance, latitude, longitude }) => {
  const [isDay, setIsDay] = useState(true);

  const getPoem = () => {
    const myCountry = "Japan"
    if (country_name === myCountry) {
      return distance < 150
        ? "咫尺天涯近，相逢笑语频。"
        : "山川虽异域，风月亦同天。"
    } else {
      return distance < 4000
        ? "青山一道同云雨，明月何曾是两乡。"
        : distance < 8000
        ? "海上生明月，天涯共此时。"
        : "相去万余里，各在天一涯。"
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <h2>你的 IP 信息</h2>
        <p><strong>IP: </strong> {ip} </p>
        <p><strong>位置: </strong> {location} </p>
        <div className={styles.distance}>
          <p>相距<strong> {distance} </strong>km</p>
          <blockquote className={styles.poem}>{getPoem()}</blockquote>
        </div>
      </div>
      <div className={[styles.globePanel, isDay ? styles.day : styles.night].join(' ')}>
        { Number.isFinite(latitude) && Number.isFinite(longitude) ? (
          <GlobeScene
            myLocation={myLocation}
            visitorLocation={{ lat: latitude, lon: longitude }}
            isDay={isDay}
          />
        ) : (
          <p className={styles.loading}>正在定位...</p>
        )}
        <button
          className={styles.toggleButton}
          onClick={() => setIsDay(!isDay)}
        >
          {isDay ? "昼": "夜" }
        </button>
      </div>
    </div>
  )
}

export default IPCard;
