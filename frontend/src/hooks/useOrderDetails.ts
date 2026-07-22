import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../lib/fetchApi";
import { useParams } from "react-router";
import type { orders } from "../types/types";

export function useOrderDetails() {

    const { id } = useParams();
    const { getToken } = useAuth();

    const { data: orderDetails, isLoading, error } = useQuery({
        queryKey: ['orderDetails'],
        queryFn: () => fetchApi(`/orders/get-order-by-id/${id}`, { getToken }),
        enabled: Boolean(id)
    })

    const order: orders = orderDetails?.data?.order;
    const items = orderDetails?.data?.items ?? [];

    return {
        order,
        items,
        id,
        isLoading,
        error
    }
}