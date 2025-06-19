import "../assets/styles/components/ip_card.css"

interface IPCardProps {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  // region_name: string;
  // latitude: GLfloat;
  // longitude: GLfloat;
  // is_proxy: boolean;
}

const IPCard: React.FC<IPCardProps> = ({ ip, country_name, location, distance}) => {
  const getPoem = () => {
    const myCountry = "Japan"
    if (country_name === myCountry) {
      return distance < 100
        ? "咫尺天涯近，相逢笑语频。"
        : "山川虽异域，风月亦同天。"
    } else {
      return distance < 1000
        ? "青山一道同云雨，明月何曾是两乡。"
        : distance < 8000
        ? "海上生明月，天涯共此时。"
        : "相去万余里，各在天一涯。"
    }
  };

  return (
    <div className="ip-card">
      <h2>你的 IP 信息</h2>
      <div className="card-info">
        <p><strong>IP: </strong> {ip} </p>
        <p><strong>位置: </strong> {location} </p>
        {/* <p><strong>地区: </strong> {info.region_name} </p> */}
        {/* <p><strong>纬度: </strong> {info.latitude} </p> */}
        {/* <p><strong>经度: </strong> {info.longitude} </p> */}
        {/* <p><strong>是否代理: </strong> {info.ip} ? 是 : 否 </p> */}
        <div className="distance">
          <p>我们相距<strong> {distance} </strong>km</p>
          <blockquote className="poem">{getPoem()}</blockquote>
        </div>
      </div>
    </div>
  )
}

export default IPCard;