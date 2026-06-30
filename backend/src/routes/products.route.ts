import { Router } from "express";
import { getCategories, getProductBySlug, getProducts } from "../controllers/products.controller";

const router = Router()

router.get('/get-products', getProducts)
router.get('/get-categories', getCategories)
router.get('/get-product-by-slug/:slug', getProductBySlug)

export default router