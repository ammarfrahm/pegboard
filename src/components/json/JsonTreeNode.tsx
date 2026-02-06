import { useState, memo, useCallback } from 'react';

interface JsonTreeNodeProps {
  keyName: string | null;
  value: unknown;
  path: string;
  depth: number;
  onPathSelect?: (path: string) => void;
  isLast: boolean;
}

function getType(value: unknown): 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as 'string' | 'number' | 'boolean' | 'object';
}

function childPath(parentPath: string, key: string | number): string {
  if (typeof key === 'number') return `${parentPath}[${key}]`;
  // Use bracket notation if key has special characters
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return `${parentPath}.${key}`;
  return `${parentPath}["${key}"]`;
}

const JsonTreeNodeInner = ({ keyName, value, path, depth, onPathSelect, isLast }: JsonTreeNodeProps) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const type = getType(value);
  const isContainer = type === 'object' || type === 'array';
  const comma = isLast ? '' : ',';

  const handleKeyClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPathSelect?.(path);
  }, [onPathSelect, path]);

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const renderKey = () => {
    if (keyName === null) return null;
    return (
      <span
        onClick={handleKeyClick}
        style={{ color: 'var(--foreground)', cursor: 'pointer' }}
        title={path}
      >
        "{keyName}"
      </span>
    );
  };

  const renderColon = () => {
    if (keyName === null) return null;
    return <span style={{ color: 'var(--muted)' }}>: </span>;
  };

  // Primitive values
  if (!isContainer) {
    let rendered: React.ReactNode;
    let color: string;

    if (type === 'string') {
      color = 'var(--accent)';
      rendered = `"${value as string}"`;
    } else if (type === 'number') {
      color = 'var(--success)';
      rendered = String(value);
    } else if (type === 'boolean') {
      color = 'var(--danger)';
      rendered = String(value);
    } else {
      // null
      color = 'var(--danger)';
      rendered = 'null';
    }

    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {renderKey()}
        {renderColon()}
        <span style={{ color }}>{rendered}</span>
        <span style={{ color: 'var(--muted)' }}>{comma}</span>
      </div>
    );
  }

  // Object / Array
  const isArray = type === 'array';
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [i, v] as const)
    : Object.entries(value as Record<string, unknown>);
  const count = entries.length;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const summary = isArray ? `${count} item${count !== 1 ? 's' : ''}` : `${count} key${count !== 1 ? 's' : ''}`;

  // Empty container
  if (count === 0) {
    return (
      <div style={{ paddingLeft: depth * 20 }}>
        {renderKey()}
        {renderColon()}
        <span style={{ color: 'var(--muted)' }}>
          {openBracket}{closeBracket}
        </span>
        <span style={{ color: 'var(--muted)' }}>{comma}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Toggle line */}
      <div
        onClick={handleToggle}
        style={{
          paddingLeft: depth * 20,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 16,
            color: 'var(--muted)',
            transition: 'transform 0.15s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transformOrigin: 'center',
            fontSize: '0.7em',
          }}
        >
          &#9654;
        </span>
        {renderKey()}
        {renderColon()}
        <span style={{ color: 'var(--muted)' }}>{openBracket}</span>
        {!expanded && (
          <span style={{ color: 'var(--muted)' }}>
            {' '}...{' '}
            {closeBracket}
            <span style={{ fontSize: '0.85em', opacity: 0.6 }}> // {summary}</span>
            {comma}
          </span>
        )}
      </div>

      {/* Children */}
      {expanded && (
        <>
          {entries.map(([key, val], idx) => (
            <JsonTreeNode
              key={isArray ? idx : (key as string)}
              keyName={isArray ? null : (key as string)}
              value={val}
              path={childPath(path, key)}
              depth={depth + 1}
              onPathSelect={onPathSelect}
              isLast={idx === count - 1}
            />
          ))}
          <div style={{ paddingLeft: depth * 20 }}>
            <span style={{ display: 'inline-block', width: 16 }} />
            <span style={{ color: 'var(--muted)' }}>
              {closeBracket}
            </span>
            <span style={{ color: 'var(--muted)' }}>{comma}</span>
          </div>
        </>
      )}
    </div>
  );
};

export const JsonTreeNode = memo(JsonTreeNodeInner);
