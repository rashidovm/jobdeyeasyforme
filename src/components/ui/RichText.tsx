import React from 'react';

/**
 * Lightweight formatter: blank lines = new paragraphs, single line breaks
 * are KEPT inside a paragraph, lines starting with "-", "*" or "•" = bullets,
 * "# " = heading, "## " = subheading, **text** = bold.
 * Plain text in, React out — no HTML injection.
 */

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-bold text-ink">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('_') && p.endsWith('_') && p.length > 2) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function RichText({ text, className = '', justify = false }: { text: string; className?: string; justify?: boolean }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const pClass = `leading-relaxed text-muted ${justify ? 'text-justify' : ''}`;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={key++} className={pClass}>
          {para.map((ln, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {inline(ln)}
            </React.Fragment>
          ))}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-5 text-muted marker:text-gold">
          {list.map((item, i) => <li key={i} className="leading-relaxed">{inline(item)}</li>)}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith('## ')) {
      flushPara(); flushList();
      blocks.push(<h3 key={key++} className="mt-6 text-xl">{inline(line.slice(3))}</h3>);
    } else if (line.startsWith('# ')) {
      flushPara(); flushList();
      blocks.push(<h2 key={key++} className="mt-8 text-2xl">{inline(line.slice(2))}</h2>);
    } else if (/^[-*•]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*•]\s+/, ''));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara(); flushList();

  return <div className={`space-y-4 ${className}`}>{blocks}</div>;
}
