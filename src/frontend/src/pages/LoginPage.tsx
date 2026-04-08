import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      data-ocid="login-screen"
    >
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="8"
              width="24"
              height="18"
              rx="3"
              stroke="oklch(var(--primary-foreground))"
              strokeWidth="2"
            />
            <path
              d="M4 13h24"
              stroke="oklch(var(--primary-foreground))"
              strokeWidth="2"
            />
            <rect
              x="9"
              y="18"
              width="5"
              height="4"
              rx="1"
              fill="oklch(var(--primary-foreground))"
            />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            WeeklySpend
          </h1>
          <p className="mt-1.5 text-base font-body text-muted-foreground">
            Track spending. Stay on budget.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="card-elevated w-full max-w-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            Sign in to continue
          </p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">
            Your spending data is private and securely linked to your account.
          </p>
        </div>

        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn || isInitializing}
          data-ocid="signin-btn"
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-base min-h-[56px] transition-smooth active:scale-95 disabled:opacity-60 shadow-sm"
        >
          {isLoggingIn || isInitializing ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <span>Sign In with Internet Identity</span>
          )}
        </button>

        <p className="text-xs font-body text-muted-foreground text-center">
          No password needed — secure, private, and free.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs font-body text-muted-foreground text-center">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
