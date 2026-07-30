import { useNavigate } from "react-router";
import { useAdmin } from "../hooks/useAdmin"
import { AdminProductsTableSkeleton } from "../components/LoadingSkeletons";
import type { Product } from "../types/types";
import { PackageIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imagekitUrl";
import { formatPrice } from "../lib/format";
import AdminProductForm from "../components/AdminProductForm";

function AdminProducts() {
    const navigate = useNavigate()
    const {
        isModalOpen,
        setIsModalOpen,
        editing,
        setEditing,
        isAdmin,
        adminProducts,
        isLoading,
        upsertProductMutation,
        deleteMutation,
        getToken
    } = useAdmin();

    if (!isAdmin) {
         navigate("/");
    }

    const handleDeleteProduct = (product: Product) => {
         if (!window.confirm(`Delete "${product.name}" permanently?`)) return;

        deleteMutation.mutate(product.id)
    }

    return (
        <div className="text-left">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <PackageIcon className="size-8 text-secondary" aria-hidden />
                    <div>
                        <h1 className="text-2xl font-bold text-base-content">Products</h1>
                        <p className="text-sm text-base-content/60">Manage catalog (admin only).</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    onClick={() => {
                        setEditing(null);
                        setIsModalOpen(true);
                    }}
                >
                    <PlusIcon className="size-4" aria-hidden />
                    Add product
                </button>
            </div>

            {isLoading ? (
                <AdminProductsTableSkeleton />
            ) :  (
                <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th className="w-24">Preview</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Slug</th>
                                <th>Price</th>
                                <th>Active</th>
                                <th />
                            </tr>
                        </thead>

                        <tbody>
                            {adminProducts && adminProducts.length > 0 && adminProducts.map((product: Product) => (
                                <tr key={product.id}>
                                    <td className="align-middle">
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-base-300/50 sm:h-18 sm:w-18">
                                            {product.imageUrl ? (
                                                <img
                                                    src={imageKitOptimizedUrl(product.imageUrl, IK_PRESETS.adminThumb)}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-base-300 to-base-200">
                                                    <PackageIcon className="size-6 text-base-content/35" aria-hidden />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="font-medium">{product.name}</td>
                                    <td>
                                        <span className="badge badge-ghost badge-sm">{product.category ?? "-"}</span>
                                    </td>
                                    <td className="font-mono text-sm opacity-80">{product.slug}</td>
                                    <td>{formatPrice(product.priceCents, product.currency)}</td>
                                    <td>
                                        {product.active ? (
                                            <span className="badge badge-success badge-sm">yes</span>
                                        ) : (
                                            <span className="badge badge-ghost badge-sm">no</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs gap-1"
                                                onClick={() => {
                                                    setEditing(product);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <PencilIcon className="size-3" aria-hidden />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs gap-1 text-error hover:bg-error/10"
                                                disabled={deleteMutation.isPending && deleteMutation.variables === product.id}
                                                onClick={() => handleDeleteProduct(product)}
                                            >
                                                {deleteMutation.isPending && deleteMutation.variables === product.id ? (
                                                    <span className="loading loading-spinner loading-xs" />
                                                ) : (
                                                    <Trash2Icon className="size-3" aria-hidden />
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box max-w-lg">
                    <h3 className="text-lg font-bold">{editing ? "Edit product" : "New product"}</h3>

                    <AdminProductForm
                        key={editing?.id ?? "new"}
                        initial={editing!}
                        saving={upsertProductMutation.isPending}
                        error={upsertProductMutation.isError}
                        getToken={getToken}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditing(null);
                        }}
                        onSubmit={(body: any) => upsertProductMutation.mutate({ body, id: editing?.id })}
                    />
                </div>

                <button
                    type="button"
                    className="modal-backdrop bg-neutral/50"
                    onClick={() => {
                        setIsModalOpen(false);
                        setEditing(null);
                    }}
                />
            </dialog>
        </div>
    )
}

export default AdminProducts
