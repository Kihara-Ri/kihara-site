import React from "react";
import "@/assets/styles/ai-widgets.css";

interface ChatProps {
  text: string;
  role: 'question' | 'answer';
}

const ChatBubble: React.FC<ChatProps> = ({ text, role }) => {
  return (
    <div className={role === 'question' ? 'question-bubble' : 'answer-bubble'}>
      {text}
    </div>
  )
}

export default ChatBubble;