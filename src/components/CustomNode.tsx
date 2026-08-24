import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Database, Server, Cog, FileText, AlertTriangle } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  database: <Database className="w-5 h-5 text-blue-400" />,
  server: <Server className="w-5 h-5 text-green-400" />,
  action: <Cog className="w-5 h-5 text-accent" />,
  document: <FileText className="w-5 h-5 text-foreground/70" />,
  warning: <AlertTriangle className="w-5 h-5 text-destructive" />,
};

export const CustomNode = memo(({ data }: any) => {
  const iconType = data.icon || "action";

  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-background border border-border flex items-center gap-3 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-accent"
      />

      <div className="flex-shrink-0 bg-muted/50 p-2 rounded-lg">
        {iconMap[iconType] || iconMap.action}
      </div>

      <div className="flex-1">
        <div className="text-sm font-bold text-foreground">{data.label}</div>
        {data.subLabel && (
          <div className="text-xs text-foreground/50 mt-0.5">
            {data.subLabel}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-accent"
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";
