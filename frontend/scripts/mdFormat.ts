function basicFormat(text: string): string {
  // 转义 HTML 字符，防止注入
  text = text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#39;")
  // 处理加粗: **文本**
  // 用非贪婪匹配 .*? 避免跨多个加粗
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // 处理斜体: *文本*
  text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');

  // 处理超链接: [文本](链接)
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return text;
}

export default basicFormat;