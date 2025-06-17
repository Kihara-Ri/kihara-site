import React, { useState } from 'react'
import "../assets/styles/components/heat_map.css"

type DayStatus = 'past' | 'today' | 'future' | 'empty'

interface DayCellProps {
  day?: number; // 有空格子的可能性
  status: DayStatus;
  date?: Date;
  onClick?: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, status, date, onClick }) => {
  let bgColor = '';
  if (status === 'past') bgColor = "#2fb548";
  else if (status === 'today') bgColor = "#f58f0a";
  else if (status === 'future') bgColor = "#b8b8b8";
  else bgColor = "#e0e0e0"; // 空格子

  const handleClick = () => {
    if (date && onClick) {
      onClick(date);
    }
  };

  return (
    <div 
      className="day-cell"
      title={`Day ${day}`}
      style={{ backgroundColor: bgColor, cursor: status !== 'empty' ? 'pointer' : "default" }}
      onClick={handleClick}
    >
      {status === 'empty' ? '' : day}
    </div>
  )
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

const MonthHeatmap: React.FC = () => {
  const today = new Date();

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 从 0 开始计数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay(); // 0=Sun, ..., 6=Sat

  const selectedToday = today.getFullYear() === year && today.getMonth() === month;

  // 总共需要最多 42 个格子 6行 x 7列
  const totalCells = 42;
  const cells: {day?: number, status: DayStatus, date?: Date}[] = [];

  // 填充前部分空白
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ status: 'empty'});
  }

  // 填充当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    let status: DayStatus;
    const current = new Date(year, month, i);

    if (selectedToday && i < today.getDate()) status = 'past';
    else if (selectedToday && i === today.getDate()) status = 'today';
    else status = current < today ? 'past' : 'future';

    cells.push({ day: i, status, date: current });
  }
  // 填充尾部空白
  while (cells.length < totalCells) {
    cells.push({ status: 'empty'});
  }

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }
  const handleDayClick = (date: Date) => {
    alert(`📅 ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
  }

  return (
    <div className="month-container">
      <div className="header">
        <button type="button" onClick={handlePrevMonth}>←</button>
        <h2>{year} 年 {month + 1} 月</h2>
        <button type="button" onClick={handleNextMonth}>→</button>
      </div>

      <div className="week-labels">
        {weekLabels.map(label => (
          <div className="week-label" key={label}>{label}</div>
        ))}
      </div>

      <div className="cells-container">
        {cells.map((cell, index) => (
          <DayCell key={index} {...cell} onClick={handleDayClick}></DayCell>
        ))}
      </div>
    </div>
  )
}

export default MonthHeatmap;