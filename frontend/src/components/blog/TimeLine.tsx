import { posts } from '../../types/posts-data';
import { Link } from 'react-router-dom';
import React from 'react';
import styles from './TimeLine.module.css';

const TimeLine: React.FC = () => {
  const byYear = posts.reduce<Record<string, typeof posts>>((acc, p) => {
    const y = new Date(p.cdate).getFullYear().toString();
    (acc[y] ||= []).push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <section className={styles.timeline}>
      {years.map(y => (
        <div  key={y} className={styles.yearBlock}>
          <h3>{y}</h3>
          <ul>
            {byYear[y].map(p => (
              <li key={p.id} className={styles.entry}>
                <time className={styles.date}>{p.cdate.slice(5)}</time>{' '}
                <Link to={`/blogs/${p.id}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default TimeLine;
