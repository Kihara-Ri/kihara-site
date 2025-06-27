import React from 'react';

import "../assets/styles/book-card.css";

export interface BookCardInfo {
  cover: string;
  title: string;
  author: string;
  translator?: string; // 对于一些书籍，对于翻译者要求是很严格的，因此加入
  tags: string[];
  language: string;
  publisher: string;
  intro: string;
  link: string;
  judgement: string;
  review: string;
  edition?: number;
}

const BookCard: React.FC<BookCardInfo> = (props: BookCardInfo) => {
  return (
    <article className="book-card">
      <div className="img-container">
        <img src={props.cover} alt={props.title} className="cover" />
      </div>
      <div className="content">
        <header>
          <h3 className="book-title">{props.title}</h3>
          <p className="author">{props.author}</p>
          {/* 如果有译者 */}
          {props.tags && (
            <ul className="tags">
              {props.tags.map(t => <li key={t}>{t}</li>)}
            </ul>
          )}
        </header>
        {/* intro 会弹性撑满并在内容溢出时滚动 */}
        {props.intro && <p className="intro">{props.intro}</p>}
        <footer>
          {props.link && (
            <a href={props.link} target="_blank" rel="noopener noreferrer">
              查看详情 →
            </a>
          )}
        </footer>
      </div>
    </article>
  )
}

export default BookCard;