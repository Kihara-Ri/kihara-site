import { useState, useEffect } from 'react'
import './App.css'
import IPCard from './components/IPCard';
import MonthHeatmap from './components/MonthHeatMap';

function App() {

  return (
    <div className="main_container">
      <IPCard />
      <MonthHeatmap />
    </div>
  )
}

export default App
