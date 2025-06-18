import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import basicFormat from './mdFormat.js';

// 计算当前脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// diary 目录（markdown 日志）
const diaryDir = path.resolve(__dirname, '../diary');

// 输出目录（html + json）
const outputDir = path.resolve(__dirname, '../../public/diary');

async function parseDiaryFile(file: string) {
  const inputFile = path.join(diaryDir, file);
  const match = file.match(/^(\d{4})-(\d{1,2})\.md$/);
  if (!match) return;

  const year = match[1];
  const month = Number(match[2]);

  // 读取 Markdown
  const markdown = await fs.readFile(inputFile, 'utf-8');
  const lines = markdown.split('\n');

  let html = `<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <title>${year}年${month}月 日志</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/styles/pages/diary.css">
</head>
<body>
  <h1>${year}年${month}月 日志</h1>
`;

  let currentDate = '';
  let contentBuffer: string[] = [];
  const diaryJson: Record<string, string> = {};

  const flushEntry = () => {
    if (currentDate && contentBuffer.length > 0) {
      const anchorId = currentDate; // 格式：6-1
      const contentHtml = contentBuffer.map(line => basicFormat(line)).join('<br>\n');
      html += `<div class="entry" id="${anchorId}">\n`;
      html += `<h2>${currentDate.replace('-', '/')}</h2>\n`;
      html += `<p>${contentHtml}</p>\n</div>\n`;

      diaryJson[currentDate] = contentBuffer.join('\n');
    }
  }

  for (const line of lines) {
    if (line.startsWith('# ')) {
      html += `<h1>${line.slice(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      flushEntry();
      currentDate = line.slice(3).trim().replace('/', '-'); // 比如 "6-1"
      contentBuffer = [];
    } else {
      if (line.trim() !== '') contentBuffer.push(line.trim());
    }
  }
  flushEntry();

  html += `</body>\n</html>\n`;

  // 写出 HTML
  const outHtmlPath = path.join(outputDir, `${year}-${month}.html`);
  await fs.mkdir(path.dirname(outHtmlPath), { recursive: true });
  await fs.writeFile(outHtmlPath, html, 'utf-8');

  // 写出 JSON
  const outJsonPath = path.join(outputDir, `${year}-${month}.json`);
  await fs.writeFile(outJsonPath, JSON.stringify(diaryJson, null, 2), 'utf-8');

  console.log(`✅ 生成 ${file} -> HTML + JSON`);
}

async function main() {
  const files = await fs.readdir(diaryDir);
  const mdFiles = files.filter(f => /^\d{4}-\d{1,2}\.md$/.test(f));

  for (const f of mdFiles) {
    await parseDiaryFile(f);
  }
}

main().catch(console.error);
