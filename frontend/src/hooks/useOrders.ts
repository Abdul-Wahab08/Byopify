import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../lib/fetchApi";
import type { orders, User } from "../types/types";
import { useAuth } from "@clerk/react";

export function useOrders() {
    const { isSignedIn, getToken } = useAuth();

    const { data: ordersData, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: () => fetchApi('/orders/get-orders', { getToken }),
        enabled: isSignedIn
    })

    const { data: user, } = useQuery({
        queryKey: ['loggedInUser'],
        queryFn: () => fetchApi('/me', { getToken }),
        enabled: isSignedIn
    })

    const loggedInUserData: User = user?.data;
    const isStaff = loggedInUserData?.role === "admin" || loggedInUserData?.role === "support";

    const orders: orders[] = ordersData?.data || [];

    return {
        orders,
        isLoading,
        error,
        isStaff
    }
}