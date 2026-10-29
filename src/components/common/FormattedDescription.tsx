import React from 'react';

/**
 * Parses inline markdown:
 * - ***bold & italic***
 * - **bold**
 * - *italic* or _italic_
 */
export function renderInlineFormatted(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*(?!\*)[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('***') && token.endsWith('***')) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-gray-900">
          <em className="italic">{token.slice(3, -3)}</em>
        </strong>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        <em key={match.index} className="italic text-gray-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

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
    const listMatch = rawLine.match(/^(\s*)(•\s*|[\-\*]\s+)(.+)$/);

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
