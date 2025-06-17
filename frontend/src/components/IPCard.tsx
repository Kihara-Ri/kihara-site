import { useState, useEffect } from 'react'
import "../assets/styles/components/ip_card.css"

interface IPInfo {
  ip: string;
  location: string; 
  // country_name: string;
  // region_name: string;
  // latitude: GLfloat;
  // longitude: GLfloat;
  // is_proxy: boolean;
}

const IPInfo_API = 'http://localhost:8080/api/ipinfo';
// "https://api.ip2location.io/?key=548A2DB34D7D8FAEF8409EF396739597&ip=126.65.210.162"

function IPCard() {
  const [info, setInfo] = useState<IPInfo | null>(null);

  useEffect(() => {
    fetch(IPInfo_API)
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="ip_card">
      <h1>你的 IP 信息</h1>
      {info ? (
        <div className="card-info">
          <p><strong>IP: </strong> {info.ip} </p>
          <p><strong>位置: </strong> {info.location} </p>
          {/* <p><strong>地区: </strong> {info.region_name} </p> */}
          {/* <p><strong>纬度: </strong> {info.latitude} </p> */}
          {/* <p><strong>经度: </strong> {info.longitude} </p> */}
          {/* <p><strong>是否代理: </strong> {info.ip} ? 是 : 否 </p> */}
        </div>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  )
}

export default IPCard;