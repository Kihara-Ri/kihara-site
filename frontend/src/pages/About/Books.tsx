import React from "react";
import BookCard from "../../components/BookCard";
import "../../assets/styles/books.css";
import books from '../../types/books-data';

const AboutBooks: React.FC = () => {
  return (
    <div className="books-grid">
      {books.map(book => 
        <BookCard key={book.title} {...book} />
      )}
    </div>
  )
}

export default AboutBooks;