import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ulidToHex, buildResult, type ConversionResult } from "./lib/ulid";
import { SqlBlock } from "./components/SqlBlock";
import { useCopy } from "./hooks/useCopy";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copiedId, copy } = useCopy();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (!val.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    try {
      const hex = ulidToHex(val);
      setResult(buildResult(hex));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  }, []);

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="grid-overlay" aria-hidden="true" />

      <main className="container">
        <motion.header
          className="header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="badge">DB Utility</div>
          <h1>
            ULID <span className="arrow">→</span> Hex
          </h1>
          <p className="subtitle">
            Convert a ULID string to its <code>BINARY(16)</code> hex for raw SQL queries.
            Runs entirely in your browser.
          </p>
        </motion.header>

        <motion.section
          className="input-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          aria-label="ULID input"
        >
          <label htmlFor="ulid-input" className="field-label">
            ULID string
          </label>
          <div className="input-wrap">
            <input
              id="ulid-input"
              type="text"
              value={input}
              onChange={handleChange}
              placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className={error ? "has-error" : ""}
              aria-describedby={error ? "error-msg" : undefined}
              aria-invalid={!!error}
            />
            <AnimatePresence>
              {input && (
                <motion.button
                  className="clear-btn"
                  onClick={handleClear}
                  aria-label="Clear input"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="input-meta">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p
                  key="error"
                  id="error-msg"
                  className="error-msg"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {error}
                </motion.p>
              ) : (
                <motion.p
                  key="hint"
                  className="hint-msg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {input.trim()
                    ? `${input.trim().length} / 26 characters`
                    : "26-character Crockford Base32 string"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        <AnimatePresence>
          {result && (
            <motion.section
              className="results"
              aria-label="Conversion results"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="divider">
                <span>output</span>
              </div>

              <motion.div
                className="hex-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="hex-result-header">
                  <span className="field-label">Hex (32 chars)</span>
                  <button
                    className={`copy-btn ${copiedId === "hex" ? "copied" : ""}`}
                    onClick={() => copy(result.hex, "hex")}
                    aria-label="Copy hex string"
                  >
                    {copiedId === "hex" ? "copied ✓" : "copy"}
                  </button>
                </div>
                <div className="hex-value">{result.hex}</div>
              </motion.div>

              <div className="sql-blocks">
                {result.queries.map((q, i) => (
                  <SqlBlock
                    key={`${q.label}-${q.dialect}`}
                    label={q.label}
                    dialect={q.dialect}
                    sql={q.sql}
                    copyText={q.copyText}
                    isCopied={copiedId === `q-${i}`}
                    onCopy={() => copy(q.copyText, `q-${i}`)}
                    index={i}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="footer">
          <span>no data sent anywhere · open source</span>
        </footer>
      </main>
    </div>
  );
}
