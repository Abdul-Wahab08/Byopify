import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchApi } from "../lib/fetchApi";
import type { Product } from "../types/types";

export function useProduct() {

    const { slug } = useParams();

    const { data: ProductData, isLoading, error } = useQuery({
        queryKey: ['product'],
        queryFn: () => fetchApi(`/products/get-product-by-slug/${slug}`),
        enabled: !!slug
    })

    const product: Product = ProductData?.data;

    return {
        product,
        isLoading,
        error
    }
}