import React, { useEffect, useState } from "react";

import IPCard from '../components/IPCard';
import MonthHeatmap from '../components/MonthHeatMap';
import Footer from "../components/Footer";
import { div } from "three/tsl";

const IP_API = 'https://api.ipify.org?format=json';

interface IPCardProps {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  latitude: number;
  longitude: number;
}

const Home: React.FC = () => {
  const [ipinfo, setipInfo] = useState<IPCardProps | null>(null);
  // 获取ip数据
  useEffect (() => {
    fetch(IP_API)
      .then(res => res.json())
      .then(data => {
        // 将公网IP作为参数传给后端
        fetch(`/api/ipinfo?ip=${data.ip}`)
          .then(res => res.json())
          .then(setipInfo)
        .catch((err) => {
          console.error("内部API: /api/ipinfo/ 请求出现错误")
          console.error(err);
        });
      })
  }, [])
  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* <div>NavBar</div> */}
        {/* <div className="introduction-card">我是谁</div> */}
        <div className="info-container">
          {ipinfo ? (
              <IPCard {...ipinfo} />
          ) : (
            <p>获取访问信息...</p>
          )}
        </div>
        {/* <div className="notable-work">代表作</div> */}
        {/* <div className="contact-card">联系我</div> */}
    </div>
        <Footer />
    </div>
  )
}

export default Home;