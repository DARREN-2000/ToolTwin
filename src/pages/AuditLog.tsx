import { ScrollText, Download } from "lucide-react";

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
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-foreground" /> Audit Log
          </h1>
          <p className="text-foreground/60 mt-1">
            Immutable record of all proposed and executed actions.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors cursor-pointer">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-4 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                ID
              </th>
              <th className="p-4 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Action
              </th>
              <th className="p-4 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Actor
              </th>
              <th className="p-4 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Time
              </th>
              <th className="p-4 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-mono text-sm text-foreground/70">
                  {log.id}
                </td>
                <td className="p-4 font-mono text-sm text-blue-400">
                  {log.action}
                </td>
                <td className="p-4 text-sm text-foreground">{log.user}</td>
                <td className="p-4 text-sm text-foreground/70">{log.time}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${log.status === "VERIFIED" ? "badge-verified" : "badge-blocked"}`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
