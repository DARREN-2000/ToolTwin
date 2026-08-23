import { Activity, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Overview</h1>
        <p className="text-foreground/60 mt-1">System status and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground/70">Pending Reviews</h3>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">12</p>
        </div>
        
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground/70">High Risk Actions</h3>
            <ShieldAlert className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-foreground">3</p>
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground/70">Approved Today</h3>
            <CheckCircle className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold text-foreground">48</p>
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground/70">Total Executed</h3>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">1,204</p>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
           {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">anonymize_customer("CUS-99213")</p>
                  <p className="text-sm text-foreground/50">Approved by Admin • 2 hours ago</p>
                </div>
                <span className="badge-verified px-3 py-1 rounded-full text-xs font-bold">VERIFIED</span>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
