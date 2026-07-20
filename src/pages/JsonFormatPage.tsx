import { useState, useCallback, useEffect, useRef, type ClipboardEvent } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Copy, Check, Trash2, Share2, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { JsonTreeViewer } from '../components/json/JsonTreeViewer';
import type { ExpandSignal } from '../components/json/JsonTreeNode';
import { compressToBase64, decompressFromBase64 } from '../utils/compression';
import { BIGINT_TAG, wrapBigInts, unwrapBigInts } from '../utils/bigint';

function deepUnescape(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.startsWith(BIGINT_TAG)) return value;
    try {
      const parsed = JSON.parse(wrapBigInts(value));
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

function formatJson(raw: string, unescape: boolean, minify: boolean): { output: string; parsed: unknown; error: string | null } {
  try {
    const safe = wrapBigInts(raw);
    let parsed = JSON.parse(safe);
    if (unescape) {
      parsed = deepUnescape(parsed);
    }
    const jsonStr = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
    return { output: unwrapBigInts(jsonStr), parsed, error: null };
  } catch (e) {
    return { output: '', parsed: null, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function JsonFormatPage() {
  const search = useSearch({ from: '/json' });
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [minified, setMinified] = useState(false);
  const [unescape, setUnescape] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pathCopied, setPathCopied] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied' | 'too-large' | 'warning'>('idle');
  const [expandSignal, setExpandSignal] = useState<ExpandSignal | null>(null);
  const hydratedRef = useRef(false);

  const showTree = parsed !== null && !minified;

  const process = useCallback((raw: string, unesc: boolean, mini: boolean) => {
    if (!raw.trim()) {
      setOutput('');
      setParsed(null);
      setError(null);
      return;
    }
    const result = formatJson(raw, unesc, mini);
    setOutput(result.output);
    setParsed(result.parsed);
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
    setParsed(null);
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
        setParsed(result.parsed);
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
    <div className="animate-fade-up flex flex-col lg:h-[calc(100dvh-6rem)]">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`${minified ? 'btn-primary' : 'btn-secondary'} px-4 py-2 text-sm`}
            onClick={handleMinifyToggle}
          >
            {minified ? 'Expand' : 'Minify'}
          </button>
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={unescape}
              onChange={handleUnescapeToggle}
              className="sr-only peer"
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors peer-focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_25%,transparent)] ${
                unescape ? 'border-accent bg-accent' : 'border-line bg-surface'
              }`}
            >
              {unescape && <Check className="h-3 w-3 text-accent-ink" />}
            </div>
            <span className="text-subtle">Unescape</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
          <button
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
            onClick={handleShare}
            disabled={!input.trim() || shareState === 'sharing'}
          >
            {shareState === 'sharing' ? (
              '\u2026'
            ) : shareState === 'copied' ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : shareState === 'warning' ? (
              <>
                <Check className="h-4 w-4" />
                Copied (long URL)
              </>
            ) : shareState === 'too-large' ? (
              'Too large to share'
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </button>
          <button className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="flex flex-col lg:min-h-0">
          <label className="tape-label mb-1.5 block">Input</label>
          <textarea
            className={`h-[50dvh] w-full resize-none rounded-xl border bg-surface p-4 font-mono text-sm text-ink transition-colors lg:h-auto lg:min-h-0 lg:flex-1 ${
              error
                ? 'border-bad focus:border-bad focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_25%,transparent)]'
                : 'border-line'
            }`}
            spellCheck={false}
            wrap="off"
            placeholder="Paste JSON here&#8230;"
            value={input}
            onChange={handleChange}
            onPaste={handlePaste}
          />
          {error && (
            <p className="mt-2 font-mono text-xs text-bad">{error}</p>
          )}
        </div>

        {/* Output Panel */}
        <div className="flex flex-col lg:min-h-0">
          <label className="tape-label mb-1.5 block">Output</label>
          {showTree ? (
            <div className="panel flex h-[70dvh] flex-col overflow-hidden lg:h-auto lg:min-h-0 lg:flex-1">
              <div className="flex items-center gap-4 border-b border-line px-4 py-2 text-xs text-subtle">
                <button
                  className="flex cursor-pointer items-center gap-1 transition-colors hover:text-ink"
                  onClick={handleExpandAll}
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  Expand all
                </button>
                <button
                  className="flex cursor-pointer items-center gap-1 transition-colors hover:text-ink"
                  onClick={handleCollapseAll}
                >
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                  Collapse all
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <JsonTreeViewer
                  data={parsed}
                  onPathSelect={handlePathSelect}
                  expandSignal={expandSignal}
                  onExpandSignal={setExpandSignal}
                />
              </div>
              {/* Path bar footer */}
              <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-xs text-subtle">
                <span
                  onClick={handlePathCopy}
                  className={
                    pathCopied
                      ? 'text-ok'
                      : selectedPath
                        ? 'cursor-pointer text-accent'
                        : ''
                  }
                  title={selectedPath ? 'Click to copy path' : undefined}
                >
                  {pathCopied ? 'Copied' : selectedPath ?? '\u00A0'}
                </span>
                <span>{charCount} chars</span>
              </div>
            </div>
          ) : (
            <>
              <textarea
                className="h-[50dvh] w-full resize-none rounded-xl border border-line bg-surface p-4 font-mono text-sm text-ink lg:h-auto lg:min-h-0 lg:flex-1"
                readOnly
                spellCheck={false}
                wrap="off"
                placeholder="Formatted output will appear here&#8230;"
                value={output}
              />
              {output && (
                <p className="mt-2 font-mono text-xs text-subtle">{charCount} chars</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
