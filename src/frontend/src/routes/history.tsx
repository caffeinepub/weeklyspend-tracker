import { Skeleton } from "@/components/ui/skeleton";
import { createRoute } from "@tanstack/react-router";
import { ArrowLeft, Download, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionItem } from "../components/TransactionItem";
import { WeekRow } from "../components/WeekRow";
import {
  useExportData,
  useWeekHistory,
  useWeekTransactions,
} from "../hooks/useBackend";
import { type WeekRecord, formatCurrency, formatDateRange } from "../types";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

// --- CSV export helper ---
function generateCsv(rows: [bigint, number, string, string][]): string {
  const header = "Date,Amount,Category,Description";
  const lines = rows.map(([timestamp, amount, category, description]) => {
    const ms = Number(timestamp) / 1_000_000;
    const date = new Date(ms).toISOString().slice(0, 10); // YYYY-MM-DD
    const safeDesc = `"${description.replace(/"/g, '""')}"`;
    return `${date},${amount.toFixed(2)},${category},${safeDesc}`;
  });
  return [header, ...lines].join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Detail view ---
function WeekDetail({
  week,
  onBack,
}: {
  week: WeekRecord;
  onBack: () => void;
}) {
  const startMs = Number(week.startDate) / 1_000_000;
  const endMs = Number(week.endDate) / 1_000_000;
  const dateRange = formatDateRange(startMs, endMs);
  const { data: txns, isLoading } = useWeekTransactions(week.weekId);

  const sorted = txns
    ? [...txns].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button
          type="button"
          data-ocid="back-btn"
          onClick={onBack}
          className="flex items-center gap-1 text-primary font-body font-medium text-sm transition-smooth active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 -ml-1"
          aria-label="Back to history"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Week summary card */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <p className="text-sm text-muted-foreground font-body">
          Week of {dateRange}
        </p>
        <p className="text-4xl font-display font-bold text-foreground mt-1 leading-tight">
          ${formatCurrency(week.grandTotal)}
        </p>
        <div className="flex gap-5 mt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground font-body">
              Food
            </span>
            <span className="text-base font-display font-semibold text-chart-food">
              ${formatCurrency(week.foodTotal)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground font-body">
              Recreational
            </span>
            <span className="text-base font-display font-semibold text-chart-rec">
              ${formatCurrency(week.recTotal)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground font-body">
              Utility
            </span>
            <span className="text-base font-display font-semibold text-chart-util">
              ${formatCurrency(week.utilTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction list — read-only */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">
          Transactions
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-8">
            No transactions this week.
          </p>
        ) : (
          <div className="card-elevated px-4">
            {sorted.map((tx) => (
              <TransactionItem
                key={tx.id.toString()}
                transaction={tx}
                editable={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- History list ---
function HistoryPage() {
  const [selectedWeek, setSelectedWeek] = useState<WeekRecord | null>(null);
  const { data: weeks, isLoading } = useWeekHistory();
  const exportMutation = useExportData();

  const handleExport = async () => {
    try {
      const rows = await exportMutation.mutateAsync();
      if (rows.length === 0) {
        toast.info("No data to export yet");
        return;
      }
      const csv = generateCsv(rows);
      downloadCsv(csv, "weeklyspend-export.csv");
      toast.success(`Exported ${rows.length} transactions`);
    } catch {
      toast.error("Export failed");
    }
  };

  if (selectedWeek) {
    return (
      <WeekDetail week={selectedWeek} onBack={() => setSelectedWeek(null)} />
    );
  }

  const sorted = weeks
    ? [...weeks].sort((a, b) => Number(b.startDate) - Number(a.startDate))
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-4 pb-3 shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          History
        </h1>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exportMutation.isPending}
          data-ocid="export-csv-btn"
          aria-label="Export CSV"
          className="flex items-center gap-1.5 text-sm font-body font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Download size={15} />
          {exportMutation.isPending ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-3">
        {isLoading ? (
          <>
            {["s1", "s2", "s3", "s4"].map((k) => (
              <Skeleton key={k} className="h-20 w-full rounded-2xl" />
            ))}
          </>
        ) : sorted.length === 0 ? (
          <div
            data-ocid="empty-history"
            className="flex flex-col items-center justify-center py-24 gap-3"
          >
            <History className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-base font-body text-muted-foreground text-center">
              No past weeks yet.
              <br />
              Keep tracking!
            </p>
          </div>
        ) : (
          sorted.map((week) => (
            <WeekRow
              key={week.weekId.toString()}
              week={week}
              onClick={() => setSelectedWeek(week)}
            />
          ))
        )}
      </div>
    </div>
  );
}
