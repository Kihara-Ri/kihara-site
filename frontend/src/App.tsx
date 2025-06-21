import { useEffect, useState } from 'react';
import './App.css'
import IPCard from './components/IPCard';
import MonthHeatmap from './components/MonthHeatMap';

const IP_API = 'https://api.ipify.org?format=json';
interface IPCardProps {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  latitude: number;
  longitude: number;
}

function App() {
  const [diaryData, setDiaryData] = useState<Record<string, string>>({});
  const [ipinfo, setipInfo] = useState<IPCardProps | null>(null);
  // 获取日期数据
  useEffect(() => {
    const today = new Date;
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    fetch(`/diary/${year}-${month}.json`)
    .then(res => res.json())
    .then(data => setDiaryData(data))
    .catch(console.error)
  }, [])

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
    <div className="main-container">
      {/* <div>NavBar</div> */}
      {/* <div className="introduction-card">我是谁</div> */}
      <div className="info-container">
        {ipinfo ? (
            <IPCard {...ipinfo} />
        ) : (
          <p>获取访问信息...</p>
        )}
        {/* <MonthHeatmap diaryData={diaryData} /> */}
      </div>
      {/* <div className="notable-work">代表作</div> */}
      {/* <div className="contact-card">联系我</div> */}
    </div>
  )
}

export default App
