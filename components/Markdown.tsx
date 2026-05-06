import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-tsoika">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="mt-4 mb-2 font-display text-2xl font-semibold text-rose-800"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="mt-4 mb-2 font-display text-xl font-semibold text-rose-800"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="mt-3 mb-2 font-display text-lg font-semibold text-rose-800"
              {...props}
            />
          ),
          p: (props) => (
            <p className="my-2 whitespace-pre-line" {...props} />
          ),
          strong: (props) => (
            <strong className="font-semibold text-rose-900" {...props} />
          ),
          em: (props) => <em className="italic" {...props} />,
          ul: (props) => (
            <ul className="my-2 list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />
          ),
          li: (props) => <li className="leading-relaxed" {...props} />,
          a: (props) => (
            <a
              className="text-rose-600 underline hover:text-rose-800"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: () => (
            <hr className="my-4 border-rose-200" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
