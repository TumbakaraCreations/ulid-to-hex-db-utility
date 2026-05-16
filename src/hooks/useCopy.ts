import { useState, useCallback } from "react";

export function useCopy(timeout = 1800) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(
    (text: string, id: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), timeout);
      });
    },
    [timeout]
  );

  return { copiedId, copy };
}
