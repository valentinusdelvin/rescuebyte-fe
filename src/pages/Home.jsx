import React from 'react';
import Header from '../components/Header';
import FolderCard from '../components/FolderCard';
import { useCounter } from '../hooks/useCounter';

const folderStructures = [
  {
    name: 'src/components/',
    path: 'src/components',
    description: 'Menyimpan komponen UI yang dapat digunakan kembali (reusable) di berbagai tempat.',
    examples: ['Header.jsx', 'FolderCard.jsx', 'Button.jsx']
  },
  {
    name: 'src/pages/',
    path: 'src/pages',
    description: 'Menyimpan tampilan halaman utama aplikasi (misalnya Home, About, Dashboard).',
    examples: ['Home.jsx', 'About.jsx']
  },
  {
    name: 'src/hooks/',
    path: 'src/hooks',
    description: 'Menyimpan Custom Hooks untuk logika state yang dapat dipakai ulang.',
    examples: ['useCounter.js', 'useTheme.js']
  },
  {
    name: 'src/assets/',
    path: 'src/assets',
    description: 'Menyimpan aset statis yang diproses bundler seperti gambar, ikon SVG, dan logo.',
    examples: ['react.svg', 'vite.svg', 'banner.png']
  },
  {
    name: 'public/',
    path: 'public',
    description: 'Menyimpan file statis yang diakses langsung tanpa lewat bundler (misal: favicon, robots.txt).',
    examples: ['vite.svg', 'favicon.ico']
  },
  {
    name: 'src/App.jsx & main.jsx',
    path: 'src/App.jsx',
    description: 'main.jsx adalah entry point render React ke HTML (DOM), sedangkan App.jsx adalah komponen root induk aplikasi.',
    examples: ['main.jsx', 'App.jsx', 'index.css']
  }
];

export default function Home() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div className="home-container">
      <Header />

      <section className="demo-box">
        <h3>Uji Coba Interaktif State (React Hook):</h3>
        <p>Logika tombol ini diambil dari <code>src/hooks/useCounter.js</code></p>
        <div className="counter-controls">
          <button className="btn btn-secondary" onClick={decrement}>-</button>
          <span className="counter-display">{count}</span>
          <button className="btn btn-primary" onClick={increment}>+</button>
          <button className="btn btn-reset" onClick={reset}>Reset</button>
        </div>
      </section>

      <section className="structure-section">
        <h2>Penjelasan Struktur Folder React</h2>
        <div className="cards-grid">
          {folderStructures.map((folder, index) => (
            <FolderCard
              key={index}
              name={folder.name}
              path={folder.path}
              description={folder.description}
              examples={folder.examples}
            />
          ))}
        </div>
      </section>

      <section className="quick-commands">
        <h2>Perintah Penting</h2>
        <div className="command-list">
          <div className="command-item">
            <code>npm run dev</code>
            <span>Menjalankan server development (lokal)</span>
          </div>
          <div className="command-item">
            <code>npm run build</code>
            <span>Mengompilasi proyek untuk production</span>
          </div>
          <div className="command-item">
            <code>npm run preview</code>
            <span>Melihat preview hasil build production secara lokal</span>
          </div>
        </div>
      </section>
    </div>
  );
}
