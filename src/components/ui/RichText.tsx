import React from 'react';

/**
 * Lightweight formatter: blank lines = paragraphs, lines starting with
 * "-", "*" or "•" = bullets, "# " = heading, "## " = subheading,
 * **text** = bold. No HTML injection — plain text in, React out.
 */

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-ink">{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={key++} className="leading-relaxed text-muted">{inline(para.join(' '))}</p>);
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
