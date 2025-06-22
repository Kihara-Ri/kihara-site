import React, { useState } from 'react';
import toolsIcon from '/icons/tools.svg';
import { Enhancement } from '../../types/ai';

import leftArrowIcon from '/icons/arrow-left.svg';
import '../../assets/styles/selector.css';

interface Props {
  fromLang: string;
  toLang: string;
  enhancement: Enhancement;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onEnhancementChange: (value: Enhancement) => void;
}

const enhancements: Enhancement[] = ['精细翻译', '查找同义词'];

const TranslateSelector: React.FC<Props> = ({
  fromLang,
  toLang,
  enhancement,
  onFromChange,
  onToChange,
  onEnhancementChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const isAvailable = toLang === 'en' || toLang === 'ja';
  // 按钮颜色
  const getToolsButtonClass = () => {
    if (!isAvailable) return 'tools-button disabled';
    if (enhancement) return 'tools-button active';
    return 'tools-button available';
  };

  return (
    <div className="trans-selector">
      <div className="lan-selector-container">
        <select value={fromLang} className="lan-selector" onChange={e => onFromChange(e.target.value)}>
          <option value="zh">中文</option>
          <option value="en">英文</option>
          <option value="ja">日文</option>
        </select>
        →
        <select value={toLang} className="lan-selector" onChange={e => onToChange(e.target.value)}>
          <option value="zh">中文</option>
          <option value="en">英文</option>
          <option value="ja">日文</option>
        </select>
      </div>

      <div className="enhancement-container">
        <button
          className={getToolsButtonClass()}
          onClick={() => isAvailable && setExpanded(prev => !prev)}
          disabled={!isAvailable}
        >
          <img
            src={leftArrowIcon}
            alt="toggle-arrow"
            className={`arrow-icon ${expanded ? 'left' : 'right'}`}
          />
        </button>

        <div className={`enhancement-options ${expanded ? 'expanded' : 'collapsed'}`}>
          {enhancements.map(opt => {
            const selected = enhancement === opt;
            return (
              <button
                key={opt}
                className={`enhancement-btn ${selected ? 'selected' : ''}`}
                onClick={() => onEnhancementChange(opt === enhancement ? null : opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TranslateSelector;