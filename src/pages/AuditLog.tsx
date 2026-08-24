import { ScrollText, Download, CheckCircle2, XCircle } from "lucide-react";

export default function AuditLog() {
  const logs = [
    {
      id: "LOG-9281",
      action: "anonymize_customer",
      user: "Admin",
      time: "2 hours ago",
      status: "VERIFIED",
    },
    {
      id: "LOG-9280",
      action: "delete_customer",
      user: "Approver",
      time: "5 hours ago",
      status: "BLOCKED",
    },
    {
      id: "LOG-9279",
      action: "issue_refund",
      user: "Admin",
      time: "1 day ago",
      status: "VERIFIED",
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-foreground/70" /> Audit Log
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Immutable record of all proposed and executed actions.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-secondary/50 border border-border text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors cursor-pointer shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {logs.map((log) => (
                <tr key={log.id} className="group hover:bg-muted/40 transition-colors cursor-default">
                  <td className="px-4 py-2 text-[13px] font-mono text-foreground/60 group-hover:text-foreground/90 transition-colors">
                    {log.id}
                  </td>
                  <td className="px-4 py-2 text-[13px] font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-foreground/80">{log.user}</td>
                  <td className="px-4 py-2 text-[13px] text-foreground/50">{log.time}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        log.status === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}
                    >
                      {log.status === "VERIFIED" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
