import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BusinessInfo,
  Order,
  OrderId,
  OrderInput,
  OrderStatus,
  Product,
  ProductId,
  ProductQuery,
} from "../backend";
import { createActor } from "../backend";

/* ---------------------------------------------------------------------------
   Reads
--------------------------------------------------------------------------- */

export function useGetBusinessInfo() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<BusinessInfo>({
    queryKey: ["businessInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBusinessInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListProducts(productQuery: ProductQuery = {}) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Product[]>({
    queryKey: ["products", productQuery],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts(productQuery);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: ProductId | undefined) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useListOrders(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/* ---------------------------------------------------------------------------
   Product mutations (admin)
--------------------------------------------------------------------------- */

export function useCreateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProduct(product);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ProductId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSetProductStock() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: ProductId; inStock: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setProductStock(params.id, params.inStock);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

/* ---------------------------------------------------------------------------
   Order mutations
--------------------------------------------------------------------------- */

export function useCreateOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OrderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createOrder(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSetOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: OrderId; status: OrderStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useDeleteOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: OrderId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteOrder(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
