import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import { Category as BackendCategory } from "../backend";
import type { Category, Transaction, WeekRecord, WeekSummary } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useBackendActor() {
  return useActor(createActor as any);
}

export function useTodayTransactions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Transaction[]>({
    queryKey: ["today-transactions"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getTodayTransactions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCurrentWeekTransactions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Transaction[]>({
    queryKey: ["current-week-transactions"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getCurrentWeekTransactions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCurrentWeekSummary() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<WeekSummary>({
    queryKey: ["current-week-summary"],
    queryFn: async () => {
      if (!actor)
        return {
          weekId: BigInt(0),
          startDate: BigInt(0),
          endDate: BigInt(0),
          foodTotal: 0,
          recTotal: 0,
          utilTotal: 0,
          grandTotal: 0,
        };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getCurrentWeekSummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useWeekHistory() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<WeekRecord[]>({
    queryKey: ["week-history"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getWeekHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useWeekTransactions(weekId: bigint) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Transaction[]>({
    queryKey: ["week-transactions", weekId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getWeekTransactions(weekId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSpendingLimit() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<number | null>({
    queryKey: ["spending-limit"],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getSpendingLimit();
      // Motoko ?Float returns [] | [number] — unwrap the optional
      if (Array.isArray(result)) {
        return result.length > 0 ? (result[0] as number) : null;
      }
      return result as number | null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSetSpendingLimit() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limit: number) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).setSpendingLimit(limit);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["spending-limit"] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      description,
      category,
    }: {
      id: bigint;
      amount: number;
      description: string;
      category: Category;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // Category is now a plain string matching BackendCategory enum values
      const backendCat =
        category === "Food"
          ? BackendCategory.Food
          : category === "Recreational"
            ? BackendCategory.Recreational
            : BackendCategory.Utility;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateTransaction(
        id,
        amount,
        description,
        backendCat,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["today-transactions"] });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-transactions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-summary"],
      });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).deleteTransaction(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["today-transactions"] });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-transactions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-summary"],
      });
    },
  });
}

export function useExportData() {
  const { actor } = useBackendActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getExportData() as Promise<
        [bigint, number, string, string][]
      >;
    },
  });
}

export function useCheckAndReset() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  const actorReady = !!actor && !isFetching;

  useEffect(() => {
    if (!actorReady || !actor) return;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const didReset = await (actor as any).checkAndResetWeek();
        if (didReset) {
          await queryClient.invalidateQueries({
            queryKey: ["today-transactions"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["current-week-transactions"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["current-week-summary"],
          });
          await queryClient.invalidateQueries({ queryKey: ["week-history"] });
        }
      } catch {
        // silently ignore — backend not ready yet
      }
    })();
  }, [actorReady, actor, queryClient]);
}

export function useAddTransaction() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      category,
    }: {
      amount: number;
      description: string;
      category: Category;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // Category is now a plain string matching BackendCategory enum values
      const backendCat =
        category === "Food"
          ? BackendCategory.Food
          : category === "Recreational"
            ? BackendCategory.Recreational
            : BackendCategory.Utility;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).addTransaction(amount, description, backendCat);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["today-transactions"] });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-transactions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["current-week-summary"],
      });
    },
  });
}
