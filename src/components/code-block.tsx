import { useEffect, useState } from "react";

/*
 * A shell snippet with a copy button. Only the commands are copied; the
 * comment above them is there for the reader, not the terminal.
 */

type CopyState = "idle" | "copied" | "failed";

const LABELS: Record<CopyState, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

// A clipboard, with a tick once copied and a cross if copying failed.
function ClipboardIcon({ state }: { state: CopyState }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M5.5 2.5H4.5A1.5 1.5 0 0 0 3 4v9.5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5V4a1.5 1.5 0 0 0-1.5-1.5h-1" />
      <rect x="5.5" y="1" width="5" height="3" rx="0.75" />
      {state === "idle" && <path d="M5.5 7.5h5M5.5 10h5M5.5 12.5h3" />}
      {state === "copied" && <path d="m5.25 9.5 1.9 1.9 3.6-3.9" />}
      {state === "failed" && <path d="m6 7.75 4 4m0-4-4 4" />}
    </svg>
  );
}

export function CodeBlock({
  comment,
  commands,
  className = "",
}: {
  comment?: string;
  commands: string[];
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <div className={`relative rounded-sm border border-rule bg-grounds ${className}`}>
      <pre className="overflow-x-auto p-5 pr-14 font-mono text-sm leading-relaxed">
        <code>
          {comment && <span className="text-husk"># {comment}</span>}
          {commands.map((command, i) => (
            <span key={i}>
              {(comment || i > 0) && "\n"}
              <span className="text-water">{command}</span>
            </span>
          ))}
        </code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={LABELS[state]}
        title={LABELS[state]}
        className={`absolute top-3 right-3 rounded-sm p-1.5 hover:bg-roast-shade-2 hover:text-water focus-visible:text-water ${
          state === "copied" ? "text-water" : state === "failed" ? "text-ember" : "text-husk"
        }`}
      >
        <ClipboardIcon state={state} />
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Command copied to clipboard" : ""}
        {state === "failed" ? "Could not copy the command" : ""}
      </span>
    </div>
  );
}
