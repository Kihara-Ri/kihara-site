// 集中管理参数
import { AIRequest, AIResponse } from "@/types/ai"
import { useCallback, useReducer, createContext, ReactNode, useState } from "react";

type State = {
  history: AIResponse[];
  loading: boolean;
  error: string | null;
}

const initial: State = { history: [], loading: false, error: null};

type Action = 
  | { type: "START" }
  | { type: "SUCCESS"; payload: AIResponse }
  | { type: "ERROR"; payload: string }
  | { type: "SET_HISTORY"; payload: AIResponse[] };


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { 
        ...state, 
        loading: true, 
        error: null
      };
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        history: [
          action.payload, 
          ...state.history,
        ],
      };
    case "ERROR":
      return { 
        ...state,
        loading: false,
        error: action.payload
      };
    case "SET_HISTORY":
      return {
        ...state,
        history: action.payload
      };
    default:
      return state;
  }
}

type Ctx = State & {
  ask: (req: AIRequest) => void;
  setHistory: (items: AIResponse[]) => void;
  currentQA: AIResponse | null;
  setCurrentQA: (qa: AIResponse | null) => void;
};

export const AIContext = createContext<Ctx | undefined>(undefined);

// 设置 Provider
export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [currentQA, setCurrentQA] = useState<AIResponse | null>(null);
  
  const setHistory = (items: AIResponse[]) => 
    dispatch({ type: "SET_HISTORY", payload: items });

  const ask = useCallback(async (req: AIRequest) => {
    dispatch({ type: "START" });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data: AIResponse = await res.json();
      dispatch({ type: "SUCCESS", payload: data });
    } catch (e: any) {
      dispatch({ type: "ERROR", payload: e.message || "请求失败" });
    }
  }, []);

  return (
    <AIContext.Provider value={{ ...state, ask, setHistory, currentQA, setCurrentQA }}>
      {children}
    </AIContext.Provider>
  );
}