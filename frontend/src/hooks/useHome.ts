import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../lib/fetchApi";
import { useSearchParams } from "react-router";
import type { Product } from "../types/types";

export type CategoriesType = {
    category: string
}

export function useHome() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category')?.trim() || '';

    const setCategory = (category: string) => {
        const nextCategory = new URLSearchParams(searchParams);

        if (!category) nextCategory.delete("category");
        else nextCategory.set("category", category);

        setSearchParams(nextCategory, { replace: true });
    }

    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['products-categories'],
        queryFn: () => fetchApi('/products/get-categories')
    })

    const { data: productsData, isLoading: productsLoading, error } = useQuery({
        queryKey: ['products', categoryFilter],
        queryFn: () => fetchApi(
            categoryFilter
                ? `/products/get-products?category=${categoryFilter}`
                : '/products/get-products'
        )
    })

    const categories: CategoriesType[] = categoriesData?.data || [];
    const products: Product[] = productsData?.data || [];

    return {
        categories,
        categoryFilter,
        setCategory,
        categoriesLoading,
        products,
        productsLoading,
        error
    }
}