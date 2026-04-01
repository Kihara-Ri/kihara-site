import { useState } from 'react';
import "../assets/styles/ip_card.css"
import GlobeScene from "./GlobeScene";

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
    <div className="ip-card">
      <div className="card-info">
        <h2>你的 IP 信息</h2>
        <p><strong>IP: </strong> {ip} </p>
        <p><strong>位置: </strong> {location} </p>
        <div className="distance">
          <p>相距<strong> {distance} </strong>km</p>
          <blockquote className="poem">{getPoem()}</blockquote>
        </div>
      </div>
      <div className="globe-container" 
        style={{ 
          position: "relative", width: "100%",
          background: isDay 
            ? "linear-gradient(to bottom, #cce3f9, #f9f9f9)" 
            : "radial-gradient(circle at center, #1a1a40, #000011)",
          transition: "background 0.5s ease",
          borderRadius: "10px"
        }}
      >
        { Number.isFinite(latitude) && Number.isFinite(longitude) ? (
          <GlobeScene
            myLocation={myLocation}
            visitorLocation={{ lat: latitude, lon: longitude }}
            // visitorLocation={visitorLocation}
            isDay={isDay}
          />
        ) : (
          <p>正在定位...</p>
        )}
        <button
          className="button"
          onClick={() => setIsDay(!isDay)}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          {isDay ? "昼": "夜" }
        </button>
      </div>
    </div>
  )
}

export default IPCard;
