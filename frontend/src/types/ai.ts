// AI 模型类型定义
export type TaskType = '问答' | '翻译'
export type Enhancement = '精细翻译' | '查找同义词' | null;

export interface AIRequest {
  type: TaskType;
  question: string;
  formLang?: string;
  toLang?: string;
  enhancement?: Enhancement;
}

export interface AIResponse {
  question: string;
  answer: string;
  type: TaskType;
  historyId: string;
  timestamp: string;
  fromLang?: string;
  toLang?: string;
  enhancement?: Enhancement;
}

export type HistoryItem = AIResponse;