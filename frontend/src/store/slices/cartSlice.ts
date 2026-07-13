import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface CartItem {
    id: string
    quantity: number
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
        addItem: (state, action: PayloadAction<string>) => {
            const itemId = action.payload
            const itemExist = state.items.find((i) => i.id === itemId)
            if (itemExist) {
                itemExist.quantity += 1;
            } else {
                state.items.push({
                    id: itemId,
                    quantity: 1
                })
            }
        }
    }
})

export const { addItem } = cartSlice.actions

export default cartSlice.reducer