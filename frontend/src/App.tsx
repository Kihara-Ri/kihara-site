import { useEffect, useState } from 'react';
import './App.css'
import IPCard from './components/IPCard';
import MonthHeatmap from './components/MonthHeatMap';

function App() {
  const [diaryData, setDiaryData] = useState<Record<string, string>>({});
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
    <div className="main_container">
      <IPCard />
      <MonthHeatmap diaryData={diaryData} />
    </div>
  )
}

export default App
