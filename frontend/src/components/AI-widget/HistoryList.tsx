import { HistoryItem } from "../../types/ai";
import "../../assets/styles/ai-widgets.css";

export default function HistoryList({ history }: { history: HistoryItem[] }) {
  return (
    <div className="history-list">
      <h4>历史记录：</h4>
      <ul>
        {history.map((item, index) => (
          <li key={item.historyId}>
            [{item.type}]
            {item.type === '翻译' && ` ${item.fromLang}→${item.toLang}`}
            {item.enhancement && ` (${item.enhancement})`}: 
            {item.question}
          </li>
        ))}
      </ul>
    </div>
  );
}
