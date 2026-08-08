import { useAuth } from "@clerk/react";
import { fetchApi } from "../lib/fetchApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, User } from "../types/types";
import { useState } from "react";

export function useAdmin() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const { isSignedIn, getToken } = useAuth();
    const queryClient = useQueryClient();

    const { data: userData } = useQuery({
        queryKey: ['loggedInUser'],
        queryFn: () => fetchApi('/me', { getToken }),
        enabled: isSignedIn
    })

    const user: User = userData?.data;
    const isAdmin = user?.role === "admin";

    const { data: adminProductsData, isLoading } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: () => fetchApi('/admin/list-admin-products', { getToken }),
        enabled: isAdmin && isSignedIn
    })

    const adminProducts: Product[] = adminProductsData?.data;

    const upsertProductMutation = useMutation({
        mutationFn: async ({body, id}: {body: any, id?: string}) => {
            if (id) {
                return fetchApi(`/admin/update-admin-product/${id}`, {
                    getToken,
                    method: "PATCH",
                    body
                })
            }

            return fetchApi("/admin/create-admin-product", {
                getToken,
                method: "POST",
                body
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            queryClient.invalidateQueries({ queryKey: ["products-categories"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsModalOpen(false);
            setEditing(null);
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return fetchApi(`/admin/delete-admin-products/${id}`, {
                getToken,
                method: "DELETE"
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            queryClient.invalidateQueries({ queryKey: ["products-categories"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            console.log("Error deleting product ", error);
        }
    })

    return {
        user,
        isModalOpen,
        setIsModalOpen,
        editing,
        setEditing,
        adminProducts,
        isLoading,
        upsertProductMutation,
        deleteMutation,
        getToken
    }
}