import React from "react";
import BookCard from "../../components/BookCard";
import books from '../../types/books-data';
import styles from './Books.module.css';
import layout from '../SectionLayout.module.css';

const AboutBooks: React.FC = () => {
  return (
    <div className={layout.prose}>
      <h2>Books</h2>
      <p className={layout.muted}>这里保留阅读记录和少量书籍摘要，它属于个人兴趣的一部分，因此仍放在 About 里。</p>
      <div className={styles.grid}>
        {books.map(book => 
          <BookCard key={book.title} {...book} />
        )}
      </div>
    </div>
  )
}

export default AboutBooks;
