import '../../assets/styles/ai-widgets.css';
import { useAI } from '@/hooks/useAI';
import ChatBubble from './ChatBubble';


export default function ChatZone() {
  const { currentQA, history, loading, error } = useAI();

  if (!currentQA) {
    return <p className="welcome">👋 你好！请输入你的问题</p>
  }
  return (
    <>
      <ChatBubble text={currentQA.question} role="question" />
      <ChatBubble text={currentQA.answer} role="answer" />
      
      {loading && <p>🤖 正在思考…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  )
}
