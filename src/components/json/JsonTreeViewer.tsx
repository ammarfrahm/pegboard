import { JsonTreeNode } from './JsonTreeNode';

interface JsonTreeViewerProps {
  data: unknown;
  onPathSelect?: (path: string) => void;
}

export function JsonTreeViewer({ data, onPathSelect }: JsonTreeViewerProps) {
  return (
    <div className="font-mono text-sm overflow-auto p-4" style={{ minHeight: 400 }}>
      <JsonTreeNode
        keyName={null}
        value={data}
        path="$"
        depth={0}
        onPathSelect={onPathSelect}
        isLast={true}
      />
    </div>
  );
}
