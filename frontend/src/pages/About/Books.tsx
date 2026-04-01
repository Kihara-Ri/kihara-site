import React from "react";
import BookCard from "../../components/BookCard";
import books from '../../types/books-data';
import styles from './Books.module.css';

const AboutBooks: React.FC = () => {
  return (
    <div className={styles.grid}>
      {books.map(book => 
        <BookCard key={book.title} {...book} />
      )}
    </div>
  )
}

export default AboutBooks;
