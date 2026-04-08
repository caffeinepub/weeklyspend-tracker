import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LogOut, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryBars } from "../components/CategoryBars";
import { TransactionItem } from "../components/TransactionItem";
import {
  useCurrentWeekSummary,
  useCurrentWeekTransactions,
  useSetSpendingLimit,
  useSpendingLimit,
  useTodayTransactions,
} from "../hooks/useBackend";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDateRange(startNs: bigint, endNs: bigint): string {
  const startMs = Number(startNs) / 1_000_000;
  const endMs = Number(endNs) / 1_000_000;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = new Date(startMs).toLocaleDateString("en-US", opts);
  const end = new Date(endMs).toLocaleDateString("en-US", opts);
  return `${start} – ${end}`;
}

function SpendingLimitModal({ onClose }: { onClose: () => void }) {
  const { data: currentLimit } = useSpendingLimit();
  const [value, setValue] = useState(
    currentLimit != null ? currentLimit.toFixed(2) : "",
  );
  const setLimit = useSetSpendingLimit();

  const handleSave = async () => {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid spending limit");
      return;
    }
    try {
      await setLimit.mutateAsync(parsed);
      toast.success("Spending limit saved");
      onClose();
    } catch {
      toast.error("Failed to save limit");
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: modal overlay dismiss
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
      data-ocid="limit-modal-overlay"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only */}
      <div
        className="w-full max-w-md bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            Weekly Spending Limit
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm font-body text-muted-foreground">
          Set a weekly budget. You'll see a warning when you exceed it.
        </p>
        <div className="space-y-1">
          <label
            htmlFor="limit-amount"
            className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Limit ($)
          </label>
          <input
            id="limit-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 200.00"
            data-ocid="limit-input"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-base font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={setLimit.isPending}
          data-ocid="limit-save-btn"
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-base min-h-[56px] transition-smooth active:scale-95 disabled:opacity-50"
        >
          {setLimit.isPending ? "Saving…" : "Save Limit"}
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    queryClient.clear();
    clear();
  };

  const { data: todayTxns, isLoading: todayLoading } = useTodayTransactions();
  const { data: weekSummary, isLoading: weekLoading } = useCurrentWeekSummary();
  const { data: weekTxns, isLoading: weekTxnsLoading } =
    useCurrentWeekTransactions();
  const { data: spendingLimit } = useSpendingLimit();

  // Compute today's totals
  const todayFood = (todayTxns ?? [])
    .filter((t) => t.category === "Food")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayRec = (todayTxns ?? [])
    .filter((t) => t.category === "Recreational")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayUtil = (todayTxns ?? [])
    .filter((t) => t.category === "Utility")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayTotal = todayFood + todayRec + todayUtil;

  const weekDateLabel =
    weekSummary && weekSummary.startDate > 0n
      ? formatDateRange(weekSummary.startDate, weekSummary.endDate)
      : "This Week";

  const grandTotal = weekSummary?.grandTotal ?? 0;
  const isOverBudget =
    spendingLimit != null && spendingLimit > 0 && grandTotal >= spendingLimit;

  const sortedWeekTxns = weekTxns
    ? [...weekTxns].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  return (
    <div className="flex flex-col gap-5 px-4 pt-0 pb-24 max-w-md mx-auto">
      {/* Header row with Settings + Sign Out */}
      <div className="flex items-center justify-between pt-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          WeeklySpend
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Spending limit settings"
            data-ocid="settings-btn"
            onClick={() => setShowLimitModal(true)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings size={20} />
          </button>
          <button
            type="button"
            aria-label="Sign out"
            data-ocid="signout-btn"
            onClick={handleSignOut}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Overspending warning banner */}
      {isOverBudget && spendingLimit != null && (
        <div
          data-ocid="over-budget-banner"
          className="flex items-center gap-2.5 bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3"
          role="alert"
        >
          <AlertTriangle
            size={18}
            className="text-destructive shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm font-body font-semibold text-destructive">
            Over budget — {formatCurrency(grandTotal)} of{" "}
            {formatCurrency(spendingLimit)} spent this week
          </p>
        </div>
      )}

      {/* Today's Spending Card */}
      <div className="card-elevated p-5" data-ocid="today-card">
        {todayLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-28" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Today's Spending
            </p>
            <p
              className="text-4xl font-bold text-foreground tabular-nums leading-none mb-4"
              data-ocid="today-total"
            >
              {formatCurrency(todayTotal)}
            </p>
            <div className="space-y-2 border-t border-border pt-3">
              {(
                [
                  { label: "Food", value: todayFood, cls: "text-chart-food" },
                  {
                    label: "Recreational",
                    value: todayRec,
                    cls: "text-chart-rec",
                  },
                  {
                    label: "Utility",
                    value: todayUtil,
                    cls: "text-chart-util",
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center"
                >
                  <span className={`text-sm font-medium ${row.cls}`}>
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Weekly Summary */}
      <div data-ocid="week-section">
        <div className="flex flex-col mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Week of
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-base font-bold text-foreground">
              {weekDateLabel}
            </p>
            {spendingLimit != null && spendingLimit > 0 && (
              <p className="text-sm font-body text-muted-foreground tabular-nums">
                {formatCurrency(grandTotal)}{" "}
                <span className="text-muted-foreground/60">/</span>{" "}
                <span
                  className={
                    isOverBudget ? "text-destructive font-semibold" : ""
                  }
                >
                  {formatCurrency(spendingLimit)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="card-elevated px-4 py-4">
          {weekLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-32 mx-auto" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <p
                className="text-5xl font-bold text-foreground tabular-nums text-center leading-none mb-2"
                data-ocid="week-total"
              >
                {formatCurrency(weekSummary?.grandTotal ?? 0)}
              </p>
              <CategoryBars
                foodTotal={weekSummary?.foodTotal ?? 0}
                recTotal={weekSummary?.recTotal ?? 0}
                utilTotal={weekSummary?.utilTotal ?? 0}
                isLoading={false}
              />
            </>
          )}
        </div>
      </div>

      {/* Current Week Transactions */}
      <div data-ocid="week-transactions-section">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          This Week's Transactions
        </p>
        {weekTxnsLoading ? (
          <div className="space-y-3">
            {["s1", "s2", "s3"].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedWeekTxns.length === 0 ? (
          <p
            className="text-sm text-muted-foreground font-body text-center py-8"
            data-ocid="empty-week-txns"
          >
            No transactions yet this week.
          </p>
        ) : (
          <div className="card-elevated px-4">
            {sortedWeekTxns.map((tx) => (
              <TransactionItem
                key={tx.id.toString()}
                transaction={tx}
                editable
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        className="fab"
        aria-label="Add transaction"
        data-ocid="fab-add"
        onClick={() => void navigate({ to: "/add" })}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {showLimitModal && (
        <SpendingLimitModal onClose={() => setShowLimitModal(false)} />
      )}
    </div>
  );
}
