import React from 'react';
import styles from './BookCard.module.css';

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
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={book.cover} alt={book.title} className={styles.cover} />
      </div>
      <div className={styles.content}>
        <header>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>{book.author}</p>
          {book.tags && (
            <ul className={styles.tags}>
              {book.tags.map(t => <li key={t} className={styles.tag}>{t}</li>)}
            </ul>
          )}
        </header>
        {book.intro && <p className={styles.intro}>{book.intro}</p>}
        <footer>
          {book.link && (
            <a className={styles.detailLink} href={book.link} target="_blank" rel="noopener noreferrer">
              查看详情 →
            </a>
          )}
        </footer>
      </div>
    </article>
  )
}

export default BookCard;
