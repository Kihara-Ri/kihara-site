import { posts } from '../../types/posts-data';
import { Link } from 'react-router-dom';
import "../../assets/styles/timeline.css";
import React from 'react';
import { MeshPostProcessingMaterial } from 'three/examples/jsm/Addons.js';
import { div, string } from 'three/tsl';

const TimeLine: React.FC = () => {
  const byYear = posts.reduce<Record<string, typeof posts>>((acc, p) => {
    const y = new Date(p.cdate).getFullYear().toString();
    (acc[y] ||= []).push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <section className="timeline">
      {years.map(y => (
        <div  key={y} className="year-block">
          <h3>{y}</h3>
          <ul>
            {byYear[y].map(p => (
              <li key={p.id}>
                <time>{p.cdate.slice(5)}</time>{' '}
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