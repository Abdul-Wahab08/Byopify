import { relations } from "drizzle-orm";
import { pgTable, uuid, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export type userRole = "admin" | "customer" | "support";
export type orderStatus = "pending" | "paid" | "failed";

export type CheckoutSessionLine = {
    productId: string;
    quantity: number;
    unitPriceCents: number;
};

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().default(""),
    clerkUserId: uuid("clerk_user_id").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: text("role").$type<userRole>().notNull().default("customer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
})

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").notNull().default("General"),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    imageUrl: text("image_url"),
    imageKitFileId: text("image_kit_file_id"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
})

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<orderStatus>().notNull().default("pending"),
    totalCents: integer("total_cents").notNull().default(0),
    polarCheckoutId: text("polar_checkout_id"),
    polarOrderId: text("polar_order_id").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
})

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull()
})

export const checkoutSessions = pgTable("checkout_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    polarCheckoutId: text("polar_checkout_id").unique(),
    lines: jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
})

export const userRelations = relations(users, ({ many }) => ({
    orders: many(orders)
}))

export const productsRelations = relations(products, ({ many }) => ({
    orders: many(orders)
}))

export const orderRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    items: many(orderItems)
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] })
}))