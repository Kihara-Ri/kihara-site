import "../../assets/styles/ai-widgets.css";
import { useEffect } from "react";
import { useAI } from "@/hooks/useAI";

export default function HistoryList() {
  const { history,
          setHistory,
          currentQA,
          setCurrentQA,
          loading,
          error
        } = useAI();

  // 首次挂载时从后端拉取历史
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/history");
        const raw = await res.json();
        // console.log(raw);

         const data = raw.map((item: any) => ({
          ...item,
          historyId: item.historyId,
         }));
        setHistory(data);
      } catch (err) {
        console.error("获取历史失败: ", err);
      }
    })();
  }, []);

  return (
    <div className="history-container">
      <h4>历史记录</h4>

      {loading && <p>加载中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length === 0 ? (
        <p>暂无记录</p>
      ) : (
        <ul className="history-list">
          {history.map((item) => (
            <li 
              key={item.historyId} 
              className={
                "history-entry" +
                (currentQA?.historyId === item.historyId ? " active" : "")
              }
              onClick={() => setCurrentQA(item)} /* 点击切换会话 */
            >
              <div className="question-title">
                {item.question}
              </div>
              <div className="status">
                <div className="task-type">
                  {item.type}
                </div>
                <div className="translate-status">
                  无
                  {item.type === '翻译' && ` ${item.fromLang}→${item.toLang}`}
                  {item.enhancement && ` (${item.enhancement})`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
