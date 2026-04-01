import React, { useEffect, useState } from "react";

import IPCard from '../components/IPCard';
import Footer from "../components/Footer";
import layout from '../components/layout/PageLayout.module.css';

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
    <div className={[layout.page, layout.pageWithFooter].join(' ')}>
      <main className={layout.main}>
        <div className={layout.contentGrid}>
          {ipinfo ? (
              <IPCard {...ipinfo} />
          ) : (
            <p className={layout.placeholder}>获取访问信息...</p>
          )}
        </div>
      </main>
        <Footer />
    </div>
  )
}

export default Home;
