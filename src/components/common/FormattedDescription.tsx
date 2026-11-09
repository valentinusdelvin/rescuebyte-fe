import { renderInlineFormatted } from '../../utils/markdown';

export interface FormattedDescriptionProps {
  content: string;
  className?: string;
}

/**
 * FormattedDescription Component
 * Renders paragraphs, bold, italics, and styled bullet lists.
 */
export function FormattedDescription({
  content,
  className = '',
}: FormattedDescriptionProps) {
  if (!content || !content.trim()) return null;

  const lines = content.split('\n');
  const blocks: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'gap' }
  > = [];

  let currentList: { type: 'list'; items: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a bullet item:
    // - bullet symbol '•' (with optional space)
    // - or '-' / '*' followed by REQUIRED whitespace (\s+)
    const listMatch = rawLine.match(/^(\s*)(•\s*|[-*]\s+)(.+)$/);

    if (listMatch) {
      const itemText = listMatch[3];
      if (!currentList) {
        currentList = { type: 'list', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(itemText);
    } else {
      currentList = null;
      if (trimmed === '') {
        // Add gap if previous wasn't already a gap
        if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'gap') {
          blocks.push({ type: 'gap' });
        }
      } else {
        blocks.push({ type: 'paragraph', text: rawLine });
      }
    }
  }

  return (
    <div className={`space-y-2 text-sm text-gray-800 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'gap') {
          return <div key={idx} className="h-1.5" />;
        }
        if (block.type === 'list') {
          return (
            <ul key={idx} className="space-y-1.5 my-1 pl-0.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-gray-800 leading-relaxed">
                    {renderInlineFormatted(item)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineFormatted(block.text)}
          </p>
        );
      })}
    </div>
  );
}
