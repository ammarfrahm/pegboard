import { useState, useCallback, type ClipboardEvent } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';

function formatJson(raw: string): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    return { output: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

function unescapeAndFormat(raw: string): { output: string; error: string | null } {
  try {
    let parsed = JSON.parse(raw);
    // If the result is a string, it was double-stringified — parse again
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return { output: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

function minifyJson(raw: string): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    return { output: JSON.stringify(parsed), error: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function JsonFormatPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = formatJson(input);
    setOutput(result.output);
    setError(result.error);
  }, [input]);

  const handleUnescape = useCallback(() => {
    if (!input.trim()) return;
    const result = unescapeAndFormat(input);
    setOutput(result.output);
    setError(result.error);
  }, [input]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    const result = minifyJson(input);
    setOutput(result.output);
    setError(result.error);
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setCopied(false);
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    e.preventDefault();
    setInput(text);
    const result = formatJson(text);
    setOutput(result.output);
    setError(result.error);
  }, []);

  const charCount = output.length.toLocaleString();

  return (
    <div className="animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={handleFormat}>
            FORMAT
          </button>
          <button className="btn-secondary" onClick={handleUnescape}>
            UNESCAPE
          </button>
          <button className="btn-secondary" onClick={handleMinify}>
            MINIFY
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                COPY
              </>
            )}
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
            CLEAR
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div>
          <label
            className="font-display text-xs tracking-wider mb-2 block"
            style={{ color: 'var(--muted)' }}
          >
            INPUT
          </label>
          <textarea
            className="font-mono text-sm border-2 w-full min-h-[500px] resize-none p-4 focus:outline-none transition-colors"
            style={{
              borderColor: error ? 'var(--danger)' : 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = `0 0 0 2px ${error ? 'var(--danger)' : 'var(--accent)'}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            spellCheck={false}
            wrap="off"
            placeholder="Paste JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
          />
          {error && (
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Output Panel */}
        <div>
          <label
            className="font-display text-xs tracking-wider mb-2 block"
            style={{ color: 'var(--muted)' }}
          >
            OUTPUT
          </label>
          <textarea
            className="font-mono text-sm border-2 w-full min-h-[500px] resize-none p-4 focus:outline-none"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
            }}
            readOnly
            spellCheck={false}
            wrap="off"
            placeholder="Formatted output will appear here..."
            value={output}
          />
          {output && (
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--muted)' }}>
              {charCount} chars
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
