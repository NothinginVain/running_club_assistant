export function NoteList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
