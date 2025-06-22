import { AIResponse } from "../../types/ai";
import "../../assets/styles/ai-widgets.css";

export default function AIResult({ result }: { result: AIResponse }) {
  return (
    <div className="ai-result">
      <h4>AI 回复：</h4>
      <p>{result.answer}</p>
    </div>
  );
}
