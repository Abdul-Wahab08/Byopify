import ImageKit from "@imagekit/nodejs";
import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { orderItems, products } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { deleteImageFromImagekit } from "../lib/imagekit";

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1).default("General"),
  description: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  imageUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageKitFileId: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  active: z.boolean().default(true),
})

const updateProductSchema = createProductSchema.partial();

function createProductUpdateSet(product: z.infer<typeof updateProductSchema>) {
  const data: Partial<typeof products.$inferInsert> = {}
  if (product.name !== undefined) data.name = product.name
  if (product.slug !== undefined) data.slug = product.slug
  if (product.category !== undefined) data.category = product.category
  if (product.description !== undefined) data.description = product.description
  if (product.priceCents !== undefined) data.priceCents = product.priceCents
  if (product.currency !== undefined) data.currency = product.currency
  if (product.imageUrl !== undefined) data.imageUrl = product.imageUrl
  if (product.imageKitFileId !== undefined) data.imageKitFileId = product.imageKitFileId
  if (product.active !== undefined) data.active = product.active
  return data
}
function getImagekitAuthParameters(_req: Request, res: Response, next: NextFunction) {
  try {
    const client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    })

    const authParameters = client.helper.getAuthenticationParameters();

    res.json({
      ...authParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  } catch (error) {
    next(error)
  }
}

async function listAdminProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))

    if (!allProducts || allProducts.length === 0) {
      return res.status(404).json({
        data: null,
        message: "No products found"
      })
    }

    res.status(200).json({
      data: allProducts,
      message: "Products fetched successfully"
    })
  } catch (error) {
    next(error)
  }
}

async function createAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsedBody = createProductSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({
        data: null,
        message: "Invalid request body"
      })
    }

    const { imageUrl, imageKitFileId, ...rest } = parsedBody.data

    const [newProduct] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl,
        imageKitFileId
      })
      .returning()

    if (!newProduct) {
      return res.status(500).json({
        data: null,
        message: "Failed to create product"
      })
    }

    res.status(201).json({
      data: newProduct,
      message: "Product created successfully"
    })
  } catch (error) {
    next(error)
  }
}

async function updateAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsedBody = updateProductSchema.safeParse(req.body)
    const productId = req.params.id as string

    if (!parsedBody.success) {
      return res.status(400).json({
        data: null,
        message: "Invalid request body"
      })
    }

    const data = createProductUpdateSet(parsedBody.data)

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        data: null,
        message: "No fields to update"
      })
    }

    const [updatedProduct] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, productId))
      .returning()

    if (!updatedProduct) {
      return res.status(404).json({
        data: null,
        message: "Product not found"
      })
    }

    res.status(200).json({
      data: updatedProduct,
      message: "Product updated successfully"
    })
  } catch (error) {
    next(error)
  }
}

async function deleteAdminProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.id as string

    const [isProductExist] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))

    if (!isProductExist) {
      return res.status(404).json({
        data: null,
        message: "Product not found"
      })
    }

    const totalOrderItems = await db.$count(orderItems, eq(orderItems.productId, productId))

    if (totalOrderItems > 0) {
      return res.status(400).json({
        data: null,
        message: "Product has one or more order items, so it can't be deleted, first deactivate it"
      })
    }

    deleteImageFromImagekit(isProductExist.imageKitFileId as string)
    await db
      .delete(products)
      .where(eq(products.id, productId))

    return res.status(200).json({
      data: null,
      message: "Product deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}

export {
  getImagekitAuthParameters,
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProducts
}