import React, { useState } from 'react'
import "../assets/styles/heat_map.css"

type DayStatus = 'past' | 'today' | 'future' | 'empty'
type DiaryData = Record<string, string> // <日期, 记录>

interface DayCellProps {
  day?: number; // 有空格子的可能性
  status: DayStatus;
  diary?: string;
  onClick?: () => void;
  onHover: (preview: string | null, x: number, y: number) => void;
  onLeave: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, status, diary, onClick, onHover, onLeave }) => {
  let bgColor = '';
  if (status === 'past') bgColor = "#2fb548";
  else if (status === 'today') bgColor = "#f58f0a";
  else if (status === 'future') bgColor = "#b8b8b8";
  else bgColor = "#e0e0e0"; // 空格子

  return (
    <div 
      className="day-cell"
      title={`Day ${day}`}
      style={{ backgroundColor: bgColor, cursor: status !== 'empty' ? 'pointer' : "default" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onHover(diary ?? null, rect.left + rect.width / 2, rect.top)
      }}
      onMouseLeave={onLeave}
    >
      {status === 'empty' ? '' : day}
    </div>
  )
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
interface MonthHeatmapProps {
  diaryData: DiaryData;
}

const MonthHeatmap: React.FC<MonthHeatmapProps> = ({ diaryData }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tooltip, setTootip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number} | null>(null);
  
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
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    window.location.href = `/diary/${y}-${m}.html#${m}-${d}`;
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
        {cells.map((cell, index) => {
          const key = cell.day ? `${month + 1}-${cell.day}` : undefined;
          return (
            <DayCell
              key={index}
              {...cell}
              diary={key ? diaryData[key] : undefined}
              onClick={() => cell.date && handleDayClick(cell.date)}
              onHover={(preview, x, y) => {
                setTootip(preview);
                setTooltipPos({ x, y });
              }}
              onLeave={() => setTootip(null)}
            />
          )}
        )}
      </div>
      {tooltip && tooltipPos && (
        <div
          className="tooltip"
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            pointerEvents: 'none', // 防止闪烁
            transform: 'translate(-50%, 40px)',
            position: 'absolute',
            zIndex: 1000,
            background: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            fontSize: '13px',
            maxWidth: '200px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            borderRadius: '4px'
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  )
}

export default MonthHeatmap;