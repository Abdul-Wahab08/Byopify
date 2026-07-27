import { Router } from "express";
import { isAdminMiddleware } from "../middlewares/isAdmin.middleware";
import { createAdminProduct, deleteAdminProducts, getImagekitAuthParameters, listAdminProducts, updateAdminProduct } from "../controllers/admin.controller";

const router = Router()
router.use(isAdminMiddleware)

router.get('/get-imagekit-auth-parameters', getImagekitAuthParameters)
router.get('/list-admin-products', listAdminProducts)
router.post('/create-admin-product', createAdminProduct)
router.patch('/update-admin-product/:id', updateAdminProduct)
router.delete('/delete-admin-products/:id', deleteAdminProducts)

export default router