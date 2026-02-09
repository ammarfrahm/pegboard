import { useState, useCallback, useMemo, useEffect, useRef, type ClipboardEvent } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Copy, Check, Trash2, Share2, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { JsonTreeViewer } from '../components/json/JsonTreeViewer';
import type { ExpandSignal } from '../components/json/JsonTreeNode';
import { compressToBase64, decompressFromBase64 } from '../utils/compression';

function deepUnescape(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return deepUnescape(parsed);
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) {
    return value.map(deepUnescape);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = deepUnescape(v);
    }
    return result;
  }
  return value;
}

function formatJson(raw: string, unescape: boolean, minify: boolean): { output: string; error: string | null } {
  try {
    let parsed = JSON.parse(raw);
    if (unescape) {
      parsed = deepUnescape(parsed);
    }
    const output = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
    return { output, error: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function JsonFormatPage() {
  const search = useSearch({ from: '/json' });
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [minified, setMinified] = useState(false);
  const [unescape, setUnescape] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pathCopied, setPathCopied] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied' | 'too-large' | 'warning'>('idle');
  const [expandSignal, setExpandSignal] = useState<ExpandSignal | null>(null);
  const hydratedRef = useRef(false);

  const parsedData = useMemo(() => {
    if (!output || minified) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output, minified]);

  const showTree = parsedData !== null && !minified;

  const process = useCallback((raw: string, unesc: boolean, mini: boolean) => {
    if (!raw.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    const result = formatJson(raw, unesc, mini);
    setOutput(result.output);
    setError(result.error);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    process(val, unescape, minified);
    setSelectedPath(null);
    setExpandSignal(null);
  }, [process, unescape, minified]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    e.preventDefault();
    setInput(text);
    process(text, unescape, minified);
    setSelectedPath(null);
    setExpandSignal(null);
  }, [process, unescape, minified]);

  const handleMinifyToggle = useCallback(() => {
    if (!input.trim()) return;
    const next = !minified;
    setMinified(next);
    process(input, unescape, next);
    setSelectedPath(null);
  }, [input, minified, unescape, process]);

  const handleUnescapeToggle = useCallback(() => {
    const next = !unescape;
    setUnescape(next);
    if (input.trim()) {
      process(input, next, minified);
    }
    setSelectedPath(null);
  }, [input, unescape, minified, process]);

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
    setMinified(false);
    setSelectedPath(null);
    setShareState('idle');
    setExpandSignal(null);
  }, []);

  const handlePathSelect = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const handlePathCopy = useCallback(() => {
    if (!selectedPath) return;
    navigator.clipboard.writeText(selectedPath);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 1500);
  }, [selectedPath]);

  const handleExpandAll = useCallback(() => {
    setExpandSignal({ action: 'expand', path: '$', gen: Date.now() });
  }, []);
  const handleCollapseAll = useCallback(() => {
    setExpandSignal({ action: 'collapse', path: '$', gen: Date.now() });
  }, []);

  const charCount = output.length.toLocaleString();

  // Hydrate from URL params on mount
  useEffect(() => {
    if (hydratedRef.current || !search.d) return;
    hydratedRef.current = true;

    const mini = search.m === true;
    const unesc = search.u !== false;

    setMinified(mini);
    setUnescape(unesc);

    decompressFromBase64(decodeURIComponent(search.d))
      .then((raw) => {
        setInput(raw);
        const result = formatJson(raw, unesc, mini);
        setOutput(result.output);
        setError(result.error);
      })
      .catch(() => {
        setError('Failed to decompress shared data');
      });
  }, [search.d, search.m, search.u]);

  const handleShare = useCallback(async () => {
    if (!input.trim()) return;
    setShareState('sharing');

    try {
      const compressed = await compressToBase64(input);
      const encoded = encodeURIComponent(compressed);

      const params = new URLSearchParams();
      params.set('d', encoded);
      if (minified) params.set('m', 'true');
      if (!unescape) params.set('u', 'false');

      const url = `${window.location.origin}/json?${params.toString()}`;

      if (url.length > 50_000) {
        setShareState('too-large');
        setTimeout(() => setShareState('idle'), 2000);
        return;
      }

      await navigator.clipboard.writeText(url);

      if (url.length > 8_000) {
        setShareState('warning');
        setTimeout(() => setShareState('idle'), 2000);
      } else {
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 1500);
      }
    } catch {
      setShareState('idle');
    }
  }, [input, minified, unescape]);

  return (
    <div className="animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`${minified ? 'btn-primary' : 'btn-secondary'} px-4 py-2 text-sm`}
            onClick={handleMinifyToggle}
          >
            {minified ? 'EXPAND' : 'MINIFY'}
          </button>
          <label className="flex items-center gap-2 font-mono text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unescape}
              onChange={handleUnescapeToggle}
              className="sr-only peer"
            />
            <div
              className="w-4 h-4 border-2 flex items-center justify-center transition-colors peer-focus-visible:shadow-[0_0_0_2px_var(--accent)]"
              style={{
                borderColor: unescape ? 'var(--accent)' : 'var(--border)',
                backgroundColor: unescape ? 'var(--accent)' : 'transparent',
              }}
            >
              {unescape && (
                <Check className="w-3 h-3" style={{ color: 'var(--accent-foreground)' }} />
              )}
            </div>
            <span style={{ color: 'var(--muted)' }}>UNESCAPE</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary px-4 py-2 text-sm flex items-center gap-2" onClick={handleCopy}>
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
          <button
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            onClick={handleShare}
            disabled={!input.trim() || shareState === 'sharing'}
          >
            {shareState === 'sharing' ? (
              '...'
            ) : shareState === 'copied' ? (
              <>
                <Check className="w-4 h-4" />
                COPIED!
              </>
            ) : shareState === 'warning' ? (
              <>
                <Check className="w-4 h-4" />
                COPIED! (long URL)
              </>
            ) : shareState === 'too-large' ? (
              'TOO LARGE'
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                SHARE
              </>
            )}
          </button>
          <button className="btn-secondary px-4 py-2 text-sm flex items-center gap-2" onClick={handleClear}>
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
            onChange={handleChange}
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
          {showTree ? (
            <div
              className="border-2"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                minHeight: 500,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                className="font-mono text-xs px-4 py-1.5 border-b-2 flex items-center gap-3"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <button
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                  onClick={handleExpandAll}
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  EXPAND ALL
                </button>
                <button
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                  onClick={handleCollapseAll}
                >
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                  COLLAPSE ALL
                </button>
              </div>
              <div className="flex-1 overflow-auto" style={{ maxHeight: 500 }}>
                <JsonTreeViewer
                  data={parsedData}
                  onPathSelect={handlePathSelect}
                  expandSignal={expandSignal}
                  onExpandSignal={setExpandSignal}
                />
              </div>
              {/* Path bar footer */}
              <div
                className="font-mono text-xs px-4 py-2 border-t-2 flex items-center justify-between"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  onClick={handlePathCopy}
                  style={{
                    cursor: selectedPath ? 'pointer' : 'default',
                    color: pathCopied ? 'var(--success)' : selectedPath ? 'var(--accent)' : 'var(--muted)',
                  }}
                  title={selectedPath ? 'Click to copy path' : undefined}
                >
                  {pathCopied ? 'Copied!' : selectedPath ?? '\u00A0'}
                </span>
                <span>{charCount} chars</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
