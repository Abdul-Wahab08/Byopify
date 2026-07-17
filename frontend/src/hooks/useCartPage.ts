import { useAuth } from "@clerk/react";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { fetchApi } from "../lib/fetchApi";
import { useState } from "react";

export function useCartPage() {
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
    const { getToken } = useAuth();

    const cartItems = useSelector((state: RootState) => state.cart.items)

    const subTotal = cartItems.reduce((sum, item) => {
        return sum + item.priceCents * item.quantity;
    }, 0)

    async function checkout() {
        setIsCheckoutLoading(true)

        const body: any = cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity
        }))

        const response = await fetchApi('/checkout', {
            getToken,
            method: 'POST',
            body
        });

        if (response.data) {
            window.location.href = response.data;
        }
        setIsCheckoutLoading(false)
    }

    return {
        cartItems,
        subTotal,
        checkout,
        isCheckoutLoading
    }
}