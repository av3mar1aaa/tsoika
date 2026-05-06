export default function RichText({ html }: { html: string }) {
  if (!html) return null;
  if (html.includes("<")) {
    return (
      <div
        className="prose-tsoika"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <div className="prose-tsoika whitespace-pre-line">{html}</div>
  );
}
