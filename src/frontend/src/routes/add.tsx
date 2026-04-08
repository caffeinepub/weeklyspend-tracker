import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAddTransaction } from "../hooks/useBackend";
import type { Category } from "../types";
import { Route as rootRoute } from "./__root";

interface CategoryOption {
  key: Category;
  label: string;
  activeClass: string;
  borderClass: string;
  labelClass: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    key: "Food",
    label: "Food",
    activeClass: "bg-[oklch(var(--chart-food))] text-white",
    borderClass: "border-[oklch(var(--chart-food))]",
    labelClass: "text-chart-food",
  },
  {
    key: "Recreational",
    label: "Recreational",
    activeClass: "bg-[oklch(var(--chart-rec))] text-white",
    borderClass: "border-[oklch(var(--chart-rec))]",
    labelClass: "text-chart-rec",
  },
  {
    key: "Utility",
    label: "Utility",
    activeClass: "bg-[oklch(var(--chart-util))] text-white",
    borderClass: "border-[oklch(var(--chart-util))]",
    labelClass: "text-chart-util",
  },
];

function AddPage() {
  const navigate = useNavigate();
  const amountRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const addTransaction = useAddTransaction();

  useEffect(() => {
    const timer = setTimeout(() => {
      amountRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const amountNum = Number.parseFloat(amount);
  const isValid =
    Number.isFinite(amountNum) && amountNum > 0 && selectedCategory !== null;

  const handleSave = async () => {
    if (!isValid || !selectedCategory) return;

    try {
      await addTransaction.mutateAsync({
        amount: amountNum,
        description: description.trim(),
        category: selectedCategory,
      });
      toast.success("Transaction saved!");
      void navigate({ to: "/" });
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 bg-card border-b border-border">
        <button
          data-ocid="add-back-btn"
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="flex items-center gap-1 text-muted-foreground transition-smooth hover:text-foreground active:scale-95 p-1 -ml-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-foreground pr-10">
          Add Transaction
        </h1>
      </header>

      {/* Form body */}
      <div className="flex flex-col flex-1 px-4 pt-6 pb-8 gap-8">
        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            Amount
          </label>
          <div className="flex items-center gap-2 card-elevated px-4 py-0 h-[72px]">
            <span className="text-3xl font-display font-semibold text-muted-foreground">
              $
            </span>
            <input
              ref={amountRef}
              id="amount"
              data-ocid="add-amount-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-3xl font-display font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              inputMode="decimal"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            Description{" "}
            <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            id="description"
            data-ocid="add-description-input"
            type="text"
            placeholder="e.g. Starbucks latte"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="card-elevated px-4 h-[56px] text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          />
        </div>

        {/* Category Picker */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Category <span className="text-destructive">*</span>
          </span>
          <fieldset className="grid grid-cols-3 gap-2">
            <legend className="sr-only">Select category</legend>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  data-ocid={`add-category-${cat.key.toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={[
                    "btn-lg flex flex-col items-center justify-center gap-1 border-2 transition-smooth rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? `${cat.activeClass} border-transparent shadow-md`
                      : `bg-card ${cat.borderClass} border-opacity-40 ${cat.labelClass}`,
                  ].join(" ")}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm font-semibold leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </fieldset>
        </div>

        <div className="flex-1" />

        {/* Save button */}
        <button
          data-ocid="add-save-btn"
          type="button"
          onClick={() => void handleSave()}
          disabled={!isValid || addTransaction.isPending}
          className={[
            "btn-lg w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl transition-smooth",
            "hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-40 disabled:pointer-events-none",
          ].join(" ")}
        >
          {addTransaction.isPending ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            "Save Transaction"
          )}
        </button>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add",
  component: AddPage,
});
