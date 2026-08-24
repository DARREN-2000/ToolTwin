import { ShieldAlert, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewQueue() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Review Queue
        </h1>
        <p className="text-foreground/60 mt-1">
          Actions awaiting human approval.
        </p>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
        {/* Mock Queue Item */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-foreground font-mono break-all">
                delete_customer
              </h3>
              <span className="badge-risk-critical px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0">
                <ShieldAlert className="w-3 h-3" /> HIGH RISK
              </span>
            </div>
            <p className="text-sm text-foreground/70 break-all">
              Params: {`{"customer_id": "CUS-10482"}`}
            </p>
            <p className="text-xs text-foreground/50 mt-2">
              Proposed by Operator • 10 minutes ago
            </p>
          </div>

          <button
            onClick={() => navigate("/review")}
            className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Review Simulation <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Another item */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors opacity-70">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-foreground font-mono break-all">
                issue_refund
              </h3>
              <span className="badge-risk-low px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
                LOW RISK
              </span>
            </div>
            <p className="text-sm text-foreground/70 break-all">
              Params: {`{"order_id": "ORD-0501", "amount": 50.00}`}
            </p>
            <p className="text-xs text-foreground/50 mt-2">
              Proposed by Operator • 1 hour ago
            </p>
          </div>

          <button className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-secondary text-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary hover:text-on-primary transition-all cursor-pointer">
            Review Simulation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
