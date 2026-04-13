import React from "react";
import BookCard from "../../components/BookCard";
import booksData from '../../content/books/books.json';
import type { BookEntry } from '../../content/books/types';
import styles from './Books.module.css';

const books = booksData as BookEntry[];

const AboutBooks: React.FC = () => {
  return (
    <div className={styles.booksShell}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Books</p>
        <h2 className={styles.title}>看过的书</h2>
        <p className={styles.summary}>
          最近看过的一些书，不按时间顺序，读后感还在准备中所以暂时只用爬虫抓了点豆瓣基本信息，原谅我吧🙏
        </p>
      </section>

      <section className={styles.list} aria-label="Bookshelf">
        {books.map((book, index) => (
          <BookCard key={book.title} index={String(index + 1).padStart(2, '0')} {...book} />
        ))}
      </section>
    </div>
  )
}

export default AboutBooks;
