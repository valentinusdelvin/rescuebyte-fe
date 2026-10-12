import React from 'react';

export default function FolderCard({ name, path, description, examples }) {
  return (
    <div className="folder-card">
      <div className="card-top">
        <span className="folder-icon">📁</span>
        <code className="folder-name">{name}</code>
      </div>
      <p className="folder-desc">{description}</p>
      <div className="folder-examples">
        <span className="example-label">Contoh file:</span>
        <ul>
          {examples.map((item, idx) => (
            <li key={idx}><code>{item}</code></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
