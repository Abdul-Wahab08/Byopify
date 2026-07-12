import { NextFunction, Request, Response } from "express";
import { products as productsTable } from "../db/schema";
import { db } from "../db";
import { and, desc, eq } from "drizzle-orm";

async function getProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const category = typeof req.query.category === "string" ? req.query.category : "";

        const activeOnly = eq(productsTable.active, true);
        const whereClause = category ? and(activeOnly, eq(productsTable.category, category)) : activeOnly;

        const products = await db
            .select()
            .from(productsTable)
            .where(whereClause)
            .orderBy(desc(productsTable.createdAt))

        res.status(200).json({
            data: products,
            message: "Products fetched successfully",
        });
    } catch (error) {
        next(error)
    }
}

async function getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
        const categories = await db
            .selectDistinct({
                category: productsTable.category
            })
            .from(productsTable)
            .where(eq(productsTable.active, true)) 

        return res.status(200).json({
            data: categories,
            message: "Categories fetched successfully",
        })
    } catch (error) {
        next(error)
    }
}

async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const { slug } = req.params;

        const product = await db
            .select()
            .from(productsTable)
            .where(and(
                eq(productsTable.active, true),
                eq(productsTable.slug, slug as string)
            ))
            .limit(1)

        return res.status(200).json({
            data: product,
            message: "Product fetched successfully",
        })

    } catch (error) {
        next(error)
    }
}

export {
    getProducts,
    getCategories,
    getProductBySlug
}