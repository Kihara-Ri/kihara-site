import React, { useState } from 'react'
import AIResult from './AIResult'
import { AIResponse } from '../../types/ai';
import '../../assets/styles/ai-widgets.css';


export default function ChatZone() {
  const [result, setResult] = useState<AIResponse | null>(null);
  return (
    <div className="chat-zone">
      {result 
      ? <AIResult result={result} />
      : <div className="say-something">问点什么吧</div>
    }
    </div>
  )
}
