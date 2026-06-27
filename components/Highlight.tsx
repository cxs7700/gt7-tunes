// Wraps occurrences of `query` in <mark> without dangerouslySetInnerHTML.
export default function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let i = 0;
  let key = 0;
  for (;;) {
    const found = lower.indexOf(q, i);
    if (found === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (found > i) parts.push(text.slice(i, found));
    parts.push(<mark key={key++}>{text.slice(found, found + q.length)}</mark>);
    i = found + q.length;
  }
  return <>{parts}</>;
}
