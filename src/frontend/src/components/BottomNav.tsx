import { useNavigate, useRouterState } from "@tanstack/react-router";
import { History, Home } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/history", label: "History", Icon: History },
] as const;

type NavPath = (typeof NAV_ITEMS)[number]["path"];

export function BottomNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      data-ocid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch max-w-md mx-auto">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const isActive =
            path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <button
              key={path}
              type="button"
              data-ocid={`nav-${label.toLowerCase()}`}
              onClick={() => void navigate({ to: path as NavPath })}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-smooth"
              />
              <span className="text-xs font-body font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
