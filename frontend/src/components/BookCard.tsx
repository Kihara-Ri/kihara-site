import React from 'react';

import "../assets/styles/book-card.css";
import "../assets/styles/tags.css";

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

const BookCard: React.FC<BookCardInfo> = (book: BookCardInfo) => {
  return (
    <article className="book-card">
      <div className="img-container">
        <img src={book.cover} alt={book.title} className="cover" />
      </div>
      <div className="content">
        <header>
          <h3 className="book-title">{book.title}</h3>
          <p className="author">{book.author}</p>
          {/* 如果有译者 */}
          {book.tags && (
            <ul className="book-tags">
              {book.tags.map(t => <li key={t} className="book-tag">{t}</li>)}
            </ul>
          )}
        </header>
        {/* intro 会弹性撑满并在内容溢出时滚动 */}
        {book.intro && <p className="intro">{book.intro}</p>}
        <footer>
          {book.link && (
            <a href={book.link} target="_blank" rel="noopener noreferrer">
              查看详情 →
            </a>
          )}
        </footer>
      </div>
    </article>
  )
}

export default BookCard;