interface CategoryBarsProps {
  foodTotal: number;
  recTotal: number;
  utilTotal: number;
  isLoading?: boolean;
}

const MIN_HEIGHT = 8;
const MAX_HEIGHT = 200;

export function CategoryBars({
  foodTotal,
  recTotal,
  utilTotal,
  isLoading = false,
}: CategoryBarsProps) {
  const grandTotal = foodTotal + recTotal + utilTotal;

  function barHeight(value: number): number {
    if (grandTotal === 0) return MIN_HEIGHT;
    return Math.max(MIN_HEIGHT, Math.round((value / grandTotal) * MAX_HEIGHT));
  }

  const bars = [
    {
      label: "Food",
      amount: foodTotal,
      height: barHeight(foodTotal),
      barClass: "chart-bar-food",
      textClass: "text-chart-food",
    },
    {
      label: "Recreational",
      amount: recTotal,
      height: barHeight(recTotal),
      barClass: "chart-bar-rec",
      textClass: "text-chart-rec",
    },
    {
      label: "Utility",
      amount: utilTotal,
      height: barHeight(utilTotal),
      barClass: "chart-bar-util",
      textClass: "text-chart-util",
    },
  ];

  if (isLoading) {
    return (
      <div
        className="flex items-end justify-around gap-4 px-2 pb-2 pt-6"
        style={{ height: MAX_HEIGHT + 48 }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full rounded-t-md bg-muted animate-pulse"
              style={{ height: 80 }}
            />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-end justify-around gap-3 px-2 pb-2 pt-4"
      style={{ height: MAX_HEIGHT + 72 }}
    >
      {bars.map((bar) => (
        <div
          key={bar.label}
          className="flex flex-col items-center gap-0 flex-1"
        >
          {/* Amount above bar */}
          <span
            className={`text-sm font-semibold mb-1 tabular-nums ${bar.textClass}`}
            data-ocid={`bar-amount-${bar.label.toLowerCase()}`}
          >
            ${bar.amount.toFixed(2)}
          </span>
          {/* Bar */}
          <div
            className={`w-full rounded-t-lg transition-all duration-500 ${bar.barClass}`}
            style={{ height: bar.height }}
            role="img"
            aria-label={`${bar.label}: $${bar.amount.toFixed(2)}`}
          />
          {/* Category name below */}
          <span
            className="text-xs font-semibold text-foreground mt-2 text-center leading-tight"
            style={{ minWidth: 0 }}
          >
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}
