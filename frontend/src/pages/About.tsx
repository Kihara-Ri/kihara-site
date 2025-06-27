import React, { useEffect, useState } from "react"
import { Outlet } from "react-router-dom";
import MonthHeatmap from "../components/MonthHeatMap";

const About: React.FC = () => {
  const [diaryData, setDiaryData] = useState<Record<string, string>>({});
  
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

  return (
    <div className="main-container">
      <h2>关于</h2>
      <MonthHeatmap diaryData={diaryData} />
      <Outlet />
    </div>
  );
};
export default About;
