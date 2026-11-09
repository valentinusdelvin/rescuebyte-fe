import React from 'react';

/** Parser inline markdown sederhana ke elemen React (bold, italic, bold-italic). */
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
        React.createElement(
          'strong',
          { key: match.index, className: 'font-extrabold text-gray-900' },
          React.createElement('em', { className: 'italic' }, token.slice(3, -3))
        )
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        React.createElement(
          'strong',
          { key: match.index, className: 'font-extrabold text-gray-900' },
          token.slice(2, -2)
        )
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        React.createElement(
          'em',
          { key: match.index, className: 'italic text-gray-800' },
          token.slice(1, -1)
        )
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
