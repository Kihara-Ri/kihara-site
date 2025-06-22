import React, { useState } from 'react'
import AIResult from './AIResult'
import { AIResponse } from '../../types/ai';


export default function ChatZone() {
  const [result, setResult] = useState<AIResponse | null>(null);
  return (
    <div>
      {result 
      ? <AIResult result={result} />
      : <p>问点什么吧</p>
    }
    </div>
  )
}
