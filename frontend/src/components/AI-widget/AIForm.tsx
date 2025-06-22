import { useState } from 'react';
import { AIResponse, TaskType, Enhancement, AIRequest } from '../../types/ai';
import "../../assets/styles/ai-widgets.css";
import "../../assets/styles/buttons.css";

import sendIcon from '/icons/paper-plane.svg';
import FunctionSelector from './FunctionSelector';
import TranslateSelector from './TranslateSelector';
import { rotate } from 'three/tsl';
import BetterInput from './BetterInput';

interface Props {
  onResult: (res: AIResponse) => void;
}

export default function AIForm({ onResult }: Props) {
  const [type, setType] = useState<TaskType>('问答');
  const [question, setQuestion] = useState('');
  const [fromLang, setFromLang] = useState('zh');
  const [toLang, setToLang] = useState('en');
  const [enhancement, setEnhancement] = useState<Enhancement>(null);

  const handleSubmit = async () => {
    const payload: AIRequest = {
      type,
      question,
      ...(type === '翻译' && { fromLang, toLang, enhancement }),
    };

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: AIResponse = await res.json();
    onResult(data);
  };

  return (
    <div className="ai-form">
      {type === '翻译' && (
        <TranslateSelector
          fromLang={fromLang}
          toLang={toLang}
          enhancement={enhancement}
          onFromChange={setFromLang}
          onToChange={setToLang}
          onEnhancementChange={setEnhancement}
        />
      )}

      <BetterInput
        value={question}
        onChange={setQuestion}
        onSubmit={handleSubmit}
        placeholder="请输入你的问题或翻译内容..."
      />
      
      <div className="function-buttons">
        <FunctionSelector
          options={['问答', '翻译']}
          value={type}
          onSelect={(val) => {
            setType(val as TaskType);
            setEnhancement(null);
          }}
        />
        <button onClick={handleSubmit} className="send-button">
          <img src={sendIcon} alt="send-icon" className="svgIcon" />
        </button>
      </div>
    </div>
  );
}
