import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { Route as rootRoute } from "./routes/__root";
import { Route as addRoute } from "./routes/add";
import { Route as historyRoute } from "./routes/history";
import { Route as indexRoute } from "./routes/index";

const routeTree = rootRoute.addChildren([indexRoute, historyRoute, addRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function DarkModeDetector() {
  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return null;
}

function AuthGate() {
  const { identity, isInitializing } = useInternetIdentity();

  // Still booting up the auth client — show nothing to avoid flash
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not signed in — show login page
  if (!identity) {
    return <LoginPage />;
  }

  // Signed in — show the full app
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <>
      <DarkModeDetector />
      <AuthGate />
    </>
  );
}
