export interface FolderCardProps {
  title?: string;
  name?: string;
  description: string;
  examples?: string[];
}

export function FolderCard({ title, name, description, examples }: FolderCardProps) {
  const cardTitle = title || name || '';
  return (
    <article className="folder-card rounded-xl border border-slate-200 p-4">
      <div className="card-top flex items-center gap-2 mb-2">
        <span className="folder-icon" aria-hidden="true">📁</span>
        <h2 className="folder-name text-base font-semibold">{cardTitle}</h2>
      </div>
      <p className="folder-desc text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {examples && examples.length > 0 && (
        <div className="folder-examples mt-3">
          <span className="example-label text-xs font-medium text-slate-400">Contoh file:</span>
          <ul className="mt-1 space-y-1">
            {examples.map((item) => (
              <li key={item}>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{item}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
