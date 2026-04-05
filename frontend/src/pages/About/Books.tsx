import React from "react";
import BookCard from "../../components/BookCard";
import booksData from '../../content/books/books.json';
import type { BookEntry } from '../../content/books/types';
import styles from './Books.module.css';

const books = booksData as BookEntry[];

const AboutBooks: React.FC = () => {
  return (
    <section className={styles.list} aria-label="Bookshelf">
      {books.map((book) => (
        <BookCard key={book.title} {...book} />
      ))}
    </section>
  )
}

export default AboutBooks;
