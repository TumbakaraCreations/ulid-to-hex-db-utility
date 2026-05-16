import { motion } from "framer-motion";

interface SqlBlockProps {
  label: string;
  dialect: string;
  sql: string;
  copyText: string;
  isCopied: boolean;
  onCopy: () => void;
  index: number;
}

function highlight(sql: string): string {
  return sql
    .replace(
      /\b(SELECT|FROM|WHERE)\b/g,
      '<span class="kw">$1</span>'
    )
    .replace(
      /\b(UNHEX|decode)\b/g,
      '<span class="fn">$1</span>'
    )
    .replace(
      /'([^']*)'/g,
      (_: string, inner: string) => `'<span class="str">${inner}</span>'`
    )
    .replace(
      /(0x[0-9A-Fa-f]+)/g,
      '<span class="hex">$1</span>'
    );
}

export function SqlBlock({
  label,
  dialect,
  sql,
  copyText,
  isCopied,
  onCopy,
  index,
}: SqlBlockProps) {
  return (
    <motion.div
      className="sql-block"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <div className="sql-block-header">
        <div className="sql-block-meta">
          <span className="sql-label">{label}</span>
          <span className="sql-dialect">{dialect}</span>
        </div>
        <button
          className={`copy-btn ${isCopied ? "copied" : ""}`}
          onClick={() => onCopy()}
          aria-label={`Copy ${label} ${dialect} query`}
        >
          {isCopied ? (
            <>
              <CheckIcon /> copied
            </>
          ) : (
            <>
              <CopyIcon /> copy
            </>
          )}
        </button>
      </div>
      <pre
        className="sql-body"
        dangerouslySetInnerHTML={{ __html: highlight(sql) }}
        aria-label={copyText}
      />
    </motion.div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
