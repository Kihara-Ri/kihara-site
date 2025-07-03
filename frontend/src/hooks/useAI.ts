import { useContext } from "react";
import { AIContext } from "@/context/AIContext";

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("错误: useAI must be used within <AIProvider>");
  return ctx;
};