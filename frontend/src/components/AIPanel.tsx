import { useState } from "react";
import { AIResponse } from "../types/ai";
import AIForm from "./AI-widget/AIForm";
import HistoryList from "./AI-widget/HistoryList";
import "../assets/styles/ai-widgets.css";
import ChatZone from "./AI-widget/chat-zone";

const AIPanel = () => {
  const [result, setResult] = useState<AIResponse | null>(null);
  const [history, setHistory] = useState<AIResponse[]>([]);

  const handleResult = (res: AIResponse) => {
    setResult(res);
    setHistory(prev => [res, ...prev]);
  };

  return (
    <div className="ai-panel">
      <div className="ai-interface">
        <ChatZone />
        <AIForm onResult={handleResult} />
      </div>
      <HistoryList history={history} />
    </div>
  )
}

export default AIPanel;