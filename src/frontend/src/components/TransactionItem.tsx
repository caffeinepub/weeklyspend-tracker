import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from "../hooks/useBackend";
import {
  type Category,
  type Transaction,
  formatCurrency,
  getCategoryLabel,
} from "../types";

const categoryStyles: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  Food: {
    dot: "chart-bar-food",
    badge: "bg-[oklch(var(--chart-food)/0.15)] text-chart-food",
    label: "Food",
  },
  Recreational: {
    dot: "chart-bar-rec",
    badge: "bg-[oklch(var(--chart-rec)/0.15)] text-chart-rec",
    label: "Rec",
  },
  Utility: {
    dot: "chart-bar-util",
    badge: "bg-[oklch(var(--chart-util)/0.15)] text-chart-util",
    label: "Utility",
  },
};

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Food", value: "Food" },
  { label: "Recreational", value: "Recreational" },
  { label: "Utility", value: "Utility" },
];

interface TransactionItemProps {
  transaction: Transaction;
  editable?: boolean;
}

function EditModal({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(transaction.amount.toFixed(2));
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<Category>(transaction.category);
  const updateMutation = useUpdateTransaction();

  const handleSave = async () => {
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        amount: parsed,
        description,
        category,
      });
      toast.success("Transaction updated");
      onClose();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: modal overlay dismiss
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
      data-ocid="edit-modal-overlay"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only */}
      <div
        className="w-full max-w-md bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            Edit Transaction
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

        {/* Amount */}
        <div className="space-y-1">
          <label
            htmlFor="edit-amount"
            className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Amount ($)
          </label>
          <input
            id="edit-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="edit-amount-input"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-base font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            htmlFor="edit-description"
            className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Description
          </label>
          <input
            id="edit-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for?"
            data-ocid="edit-description-input"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-base font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat.value;
              const style = categoryStyles[cat.label];
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  data-ocid={`edit-cat-${cat.label.toLowerCase()}`}
                  className={`py-2.5 rounded-xl text-sm font-body font-semibold border transition-colors ${
                    active
                      ? `${style.badge} border-current`
                      : "bg-muted border-transparent text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={updateMutation.isPending}
          data-ocid="edit-save-btn"
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-base min-h-[56px] transition-smooth active:scale-95 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export function TransactionItem({
  transaction,
  editable = false,
}: TransactionItemProps) {
  const label = getCategoryLabel(transaction.category);
  const style = categoryStyles[label] ?? categoryStyles.Food;
  const ms = Number(transaction.timestamp) / 1_000_000;
  const date = new Date(ms);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const [showEdit, setShowEdit] = useState(false);
  const deleteMutation = useDeleteTransaction();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(transaction.id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div
        data-ocid="transaction-item"
        className="flex items-center gap-3 py-3 border-b border-border last:border-0"
      >
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body font-medium text-foreground truncate">
            {transaction.description || "—"}
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {dateStr} · {timeStr}
          </p>
        </div>
        <span
          className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}
        >
          {style.label}
        </span>
        <span className="text-base font-display font-bold text-foreground shrink-0 min-w-[4.5rem] text-right">
          ${formatCurrency(transaction.amount)}
        </span>

        {editable && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              aria-label="Edit transaction"
              data-ocid="edit-transaction-btn"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil size={15} />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Delete transaction"
                  data-ocid="delete-transaction-btn"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{transaction.description || "This transaction"}" ($
                    {formatCurrency(transaction.amount)}) will be permanently
                    removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleDelete()}
                    data-ocid="confirm-delete-btn"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {showEdit && (
        <EditModal
          transaction={transaction}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
