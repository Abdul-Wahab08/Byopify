
export type UserRole = "admin" | "customer" | "support";
export type OrderStatus = "pending" | "paid" | "failed";

export type CheckoutSessionLine = {
    productId: string;
    quantity: number;
    unitPriceCents: number;
};

export type PreviewItem = {
    name: string;
    slug: string;
    imageUrl: string;
    quantity: number;
};

export interface User {
    id: string;
    clerkUserId: string;
    email: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string;
    priceCents: number;
    currency: string;
    imageUrl: string;
    imageKitFileId: string | null;
    active: boolean;
    createdAt: Date;
}

export interface orders {
    id: string;
    userId: string;
    status: OrderStatus;
    totalCents: number;
    previewItems?: PreviewItem[];
    polarCheckoutId: string;
    polarOrderId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface orderItems {
    id: string;
    orderId: string;
    product: Product;
    quantity: number;
    unitPriceCents: number;
}

export interface checkoutSessions {
    id: string;
    userId: string;
    polarCheckoutId: string;
    lines: CheckoutSessionLine[];
    totalCents: number;
    currency: string;
    createdAt: Date;
}