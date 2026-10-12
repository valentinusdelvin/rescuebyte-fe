import { Header } from '../components/Header';
import { FolderCard } from '../components/FolderCard';
import { useCounter } from '../hooks/useCounter';

interface FolderStructureItem {
  name: string;
  path: string;
  description: string;
  examples: string[];
}

const folderStructures: FolderStructureItem[] = [
  {
    name: 'src/components/',
    path: 'src/components',
    description: 'Menyimpan komponen UI yang dapat digunakan kembali (reusable) di berbagai tempat.',
    examples: ['Header.tsx', 'FolderCard.tsx', 'Button.tsx'],
  },
  {
    name: 'src/pages/',
    path: 'src/pages',
    description: 'Menyimpan tampilan halaman utama aplikasi (misalnya Home, About, Dashboard).',
    examples: ['Home.tsx', 'About.tsx'],
  },
  {
    name: 'src/hooks/',
    path: 'src/hooks',
    description: 'Menyimpan Custom Hooks untuk logika state yang dapat dipakai ulang.',
    examples: ['useCounter.ts', 'useTheme.ts'],
  },
  {
    name: 'src/assets/',
    path: 'src/assets',
    description: 'Menyimpan aset statis yang diproses bundler seperti gambar, ikon SVG, dan logo.',
    examples: ['react.svg', 'vite.svg', 'banner.png'],
  },
  {
    name: 'public/',
    path: 'public',
    description: 'Menyimpan file statis yang diakses langsung tanpa lewat bundler (misal: favicon, robots.txt).',
    examples: ['vite.svg', 'favicon.ico'],
  },
  {
    name: 'src/App.tsx & main.tsx',
    path: 'src/App.tsx',
    description: 'main.tsx adalah entry point render React ke HTML (DOM), sedangkan App.tsx adalah komponen root induk aplikasi.',
    examples: ['main.tsx', 'App.tsx', 'index.css'],
  },
];

export function Home() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div className="home-container">
      <Header />

      <section className="demo-box">
        <h3>Uji Coba Interaktif State (React Hook):</h3>
        <p>Logika tombol ini diambil dari <code>src/hooks/useCounter.ts</code></p>
        <div className="counter-controls">
          <button type="button" className="btn btn-secondary" onClick={decrement}>-</button>
          <span className="counter-display">{count}</span>
          <button type="button" className="btn btn-primary" onClick={increment}>+</button>
          <button type="button" className="btn btn-reset" onClick={reset}>Reset</button>
        </div>
      </section>

      <section className="structure-section">
        <h2>Penjelasan Struktur Folder React</h2>
        <div className="cards-grid">
          {folderStructures.map((folder) => (
            <FolderCard
              key={folder.name}
              name={folder.name}
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
