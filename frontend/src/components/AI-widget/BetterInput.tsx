import { useRef, useEffect } from 'react';

interface BetterInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function BetterInput({
  value,
  onChange,
  onSubmit,
  placeholder = '请输入内容...',
}: BetterInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
      style={{
        resize: 'none',
        overflow: 'hidden',
        lineHeight: '1.6',
        marginTop: '4px',
        padding: '0 12px',
        fontSize: '16px',
        // border: '1px solid #ddd',
        border: 'none',
        borderRadius: '24px',
        backgroundColor: 'var(--background-white)',
        width: '100%',
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        minHeight: '40px',
        maxHeight: '300px',
      }}
    />
  );
}
