import { ChevronRight } from "lucide-react";
import { type WeekRecord, formatCurrency, formatDateRange } from "../types";

interface MiniBarProps {
  amount: number;
  max: number;
  colorClass: string;
}

function MiniBar({ amount, max, colorClass }: MiniBarProps) {
  const pct = max > 0 ? Math.round((amount / max) * 48) : 0;
  return (
    <div
      className={`rounded-sm w-3 ${colorClass}`}
      style={{ height: `${Math.max(pct, amount > 0 ? 4 : 2)}px` }}
      aria-hidden="true"
    />
  );
}

interface WeekRowProps {
  week: WeekRecord;
  onClick: () => void;
}

export function WeekRow({ week, onClick }: WeekRowProps) {
  const startMs = Number(week.startDate) / 1_000_000;
  const endMs = Number(week.endDate) / 1_000_000;
  const dateRange = formatDateRange(startMs, endMs);
  const max = Math.max(week.foodTotal, week.recTotal, week.utilTotal, 0.01);

  return (
    <button
      type="button"
      data-ocid="week-row"
      onClick={onClick}
      className="w-full text-left card-elevated px-4 py-4 flex items-center gap-3 transition-smooth active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* Mini bars */}
      <div className="flex items-end gap-1 shrink-0 h-14 pt-2 pb-1">
        <MiniBar
          amount={week.foodTotal}
          max={max}
          colorClass="chart-bar-food"
        />
        <MiniBar amount={week.recTotal} max={max} colorClass="chart-bar-rec" />
        <MiniBar
          amount={week.utilTotal}
          max={max}
          colorClass="chart-bar-util"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-body truncate">
          Week of {dateRange}
        </p>
        <p className="text-2xl font-display font-bold text-foreground leading-tight">
          ${formatCurrency(week.grandTotal)}
        </p>
        <div className="flex gap-3 mt-1">
          <span className="text-xs text-chart-food font-body">
            F ${formatCurrency(week.foodTotal)}
          </span>
          <span className="text-xs text-chart-rec font-body">
            R ${formatCurrency(week.recTotal)}
          </span>
          <span className="text-xs text-chart-util font-body">
            U ${formatCurrency(week.utilTotal)}
          </span>
        </div>
      </div>

      <ChevronRight className="shrink-0 text-muted-foreground w-5 h-5" />
    </button>
  );
}
