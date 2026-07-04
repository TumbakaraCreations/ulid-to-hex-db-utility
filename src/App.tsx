import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ulidToHex,
  hexToUlid,
  buildUlidToHexResult,
  buildHexToUlidResult,
  type UlidToHexResult,
  type HexToUlidResult,
} from "./lib/ulid";
import { SqlBlock } from "./components/SqlBlock";
import { useCopy } from "./hooks/useCopy";
import "./App.css";

type Tab = "ulidToHex" | "hexToUlid";

const tabs: { id: Tab; label: string }[] = [
  { id: "ulidToHex", label: "ULID → Hex" },
  { id: "hexToUlid", label: "Hex → ULID" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("ulidToHex");
  const [input, setInput] = useState("");
  const [ulidToHexResult, setUlidToHexResult] = useState<UlidToHexResult | null>(null);
  const [hexToUlidResult, setHexToUlidResult] = useState<HexToUlidResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copiedId, copy } = useCopy();

  const isUlidToHex = tab === "ulidToHex";
  const result = isUlidToHex ? ulidToHexResult : hexToUlidResult;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInput(val);

      if (!val.trim()) {
        setUlidToHexResult(null);
        setHexToUlidResult(null);
        setError(null);
        return;
      }

      try {
        if (isUlidToHex) {
          const hex = ulidToHex(val);
          setUlidToHexResult(buildUlidToHexResult(hex));
          setHexToUlidResult(null);
        } else {
          const ulid = hexToUlid(val);
          const hex = val.trim().replace(/^0x/i, "").replace(/\s+/g, "").toUpperCase();
          setHexToUlidResult(buildHexToUlidResult(hex, ulid));
          setUlidToHexResult(null);
        }
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setUlidToHexResult(null);
        setHexToUlidResult(null);
      }
    },
    [isUlidToHex],
  );

  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === tab) return;
    setTab(nextTab);
    setInput("");
    setUlidToHexResult(null);
    setHexToUlidResult(null);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setUlidToHexResult(null);
    setHexToUlidResult(null);
    setError(null);
  };

  const inputHint = (() => {
    if (error) return null;
    const trimmed = input.trim();
    if (!trimmed) {
      return isUlidToHex
        ? "26-character Crockford Base32 string"
        : "32-character hex string (16 bytes)";
    }
    if (isUlidToHex) return `${trimmed.length} / 26 characters`;
    const hexLen = trimmed.replace(/^0x/i, "").replace(/\s+/g, "").length;
    return `${hexLen} / 32 characters`;
  })();

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
            ULID <span className="arrow">↔</span> Hex
          </h1>
          <p className="subtitle">
            Convert between ULID strings and <code>BINARY(16)</code> hex for raw SQL queries.
            Runs entirely in your browser.
          </p>
        </motion.header>

        <nav className="tabs" aria-label="Conversion direction">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`tab ${tab === id ? "active" : ""}`}
              onClick={() => handleTabChange(id)}
              aria-selected={tab === id}
              role="tab"
            >
              {label}
            </button>
          ))}
        </nav>

        <motion.section
          className="input-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          aria-label={isUlidToHex ? "ULID input" : "Hex input"}
          role="tabpanel"
        >
          <label htmlFor="converter-input" className="field-label">
            {isUlidToHex ? "ULID string" : "Hex string"}
          </label>
          <div className="input-wrap">
            <input
              id="converter-input"
              type="text"
              value={input}
              onChange={handleChange}
              placeholder={
                isUlidToHex ? "01ARZ3NDEKTSV4RRFFQ69G5FAV" : "017C73C10D0A802690B1D177E527DE66"
              }
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
                  {inputHint}
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
                  <span className="field-label">
                    {isUlidToHex ? "Hex (32 chars)" : "ULID (26 chars)"}
                  </span>
                  <button
                    className={`copy-btn ${copiedId === "output" ? "copied" : ""}`}
                    onClick={() =>
                      copy(
                        isUlidToHex
                          ? (result as UlidToHexResult).hex
                          : (result as HexToUlidResult).ulid,
                        "output",
                      )
                    }
                    aria-label={isUlidToHex ? "Copy hex string" : "Copy ULID string"}
                  >
                    {copiedId === "output" ? "copied ✓" : "copy"}
                  </button>
                </div>
                <div className="hex-value">
                  {isUlidToHex
                    ? (result as UlidToHexResult).hex
                    : (result as HexToUlidResult).ulid}
                </div>
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
