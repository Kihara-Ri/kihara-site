import React, { useEffect, useState } from "react";
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
      <MonthHeatmap diaryData={diaryData} />
    </div>
  );
};
export default About;
