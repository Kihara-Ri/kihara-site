import React, { useEffect, useRef, useState } from "react";
import switchesIcon from '/icons/switches.svg';
import "../../assets/styles/selector.css";

interface FunctionSelectorProps {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

const FunctionSelector: React.FC<FunctionSelectorProps> = ({ options, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="function-selector" ref={containerRef}>
      {/* 按钮 */}
      <button className="function-button" onClick={() => setOpen(prev => !prev)}>
        <img src={switchesIcon} alt="switches-icon" className="svgIcon" />
        <p>{value}</p>
      </button>

      {/* 弹出菜单 */}
      {open && (
        <div className="function-dropdown">
          {options.map(option => (
            <div
              key={option}
              className="function-option"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
  
}

export default FunctionSelector;