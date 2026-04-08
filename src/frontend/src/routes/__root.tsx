import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Layout } from "../components/Layout";
import { useCheckAndReset } from "../hooks/useBackend";

function RootComponent() {
  useCheckAndReset();
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-body",
          duration: 4000,
        }}
      />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
