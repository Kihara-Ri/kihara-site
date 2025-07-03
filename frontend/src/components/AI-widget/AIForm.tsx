import { useState } from 'react';
import { AIResponse, TaskType, Enhancement, AIRequest } from '../../types/ai';
import "../../assets/styles/ai-widgets.css";
import "../../assets/styles/buttons.css";

import sendIcon from '/icons/paper-plane.svg';
import FunctionSelector from './FunctionSelector';
import TranslateSelector from './TranslateSelector';
import BetterInput from './BetterInput';
import { useAI } from '@/hooks/useAI';

export default function AIForm() {
  const { ask, loading } = useAI();

  // 各字段独立维护
  const [type, setType] = useState<TaskType>('问答');
  const [question, setQuestion] = useState('');
  const [fromLang, setFromLang] = useState('zh');
  const [toLang, setToLang] = useState('en');
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);

  // 提交时组装 payload
  const handleSubmit = () => {
    if (!question.trim()) return; // 空输入直接返回
    const payload: AIRequest = {
      type,
      question,
      ...(type === '翻译' && { fromLang, toLang, enhancement }),
    };
    ask(payload);
    setQuestion(''); // 成功后清空输入
  }

  const handleTypeChange = (val: string) => {
    const t = val as TaskType;
    setType(t);
    if (t !== '翻译') {
      setEnhancement(null);
    }
  };

  return (
    <div className="ai-form">
      {/* 翻译专用语言 & 增强选择 */}
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

      {/* 文本输入框 */}
      <BetterInput
        value={question}
        onChange={setQuestion}
        onSubmit={handleSubmit}
        placeholder="请输入你的问题或翻译内容..."
      />
      
      <div className="function-buttons">
        {/* 功能选择: 问答 / 翻译 */}
        <FunctionSelector
          options={['问答', '翻译']}
          value={type}
          onSelect={handleTypeChange}
        />

        {/* 发送按钮 */}
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
          title={loading ? '正在思考...' : '发送'}
        >
          <img src={sendIcon} alt="send-icon" className="svgIcon" />
        </button>
      </div>
    </div>
  );
}
