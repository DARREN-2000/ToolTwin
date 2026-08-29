import { useState, useEffect } from "react";
import { ScrollText, Download, CheckCircle2, XCircle, Loader2, Inbox, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface AuditEntry {
  id: string;
  proposal_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setLogs(data as AuditEntry[]);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = "ID,Proposal ID,Event Type,Tool Name,Time\n";
    const rows = logs.map(l => `${l.id},${l.proposal_id || "N/A"},${l.event_type},${(l.event_data as any)?.tool_name || "N/A"},${l.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tooltwin_audit_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-foreground/70" /> Audit Log
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Immutable record of all proposed and executed actions. {logs.length > 0 && <span className="font-medium">{logs.length} entries</span>}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-secondary/50 border border-border text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Inbox className="w-12 h-12 text-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground/70 mb-1">No audit entries yet</h3>
          <p className="text-sm text-foreground/50">When actions are approved, blocked, or executed, they will appear here.</p>
        </div>
      ) : (
        <div className="relative border border-border rounded-lg overflow-hidden bg-background shadow-sm">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">Event</th>
                  <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.map((log) => {
                  const toolName = (log.event_data as any)?.tool_name || "N/A";
                  const verification = (log.event_data as any)?.verification || log.event_type;
                  const isSuccess = log.event_type === "EXECUTED" || verification === "VERIFIED";

                  return (
                    <tr key={log.id} className="group hover:bg-muted/40 transition-colors cursor-default">
                      <td className="px-4 py-2 text-[13px] font-mono text-foreground/60 group-hover:text-foreground/90 transition-colors">
                        {log.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-2 text-[13px] font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">
                        {toolName}
                      </td>
                      <td className="px-4 py-2 text-[13px] text-foreground/80">{log.event_type}</td>
                      <td className="px-4 py-2 text-[13px] text-foreground/50">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          isSuccess
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : log.event_type === "BLOCKED"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> :
                           log.event_type === "BLOCKED" ? <XCircle className="w-3 h-3" /> :
                           <ShieldAlert className="w-3 h-3" />}
                          {isSuccess ? "VERIFIED" : log.event_type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
