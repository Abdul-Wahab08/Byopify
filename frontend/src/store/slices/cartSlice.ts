import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Product } from "../../types/types";

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[]
}

const initialState: CartState = {
    items: [],
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<Product>) => {
            const item = action.payload
            const existingItem = state.items.find((i) => i.id === item.id)
            if (existingItem) {
                existingItem.quantity++;
            } else {
                state.items.push({
                    ...item,
                    quantity: 1
                });
            }
        },
        removeItem: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.items.filter((item) => item.id !== id);
        },
        increaseQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item) {
                item.quantity++;
            }
        },
        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item) {
                item.quantity--;
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
})

export const { addItem , removeItem, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions

export default cartSlice.reducer