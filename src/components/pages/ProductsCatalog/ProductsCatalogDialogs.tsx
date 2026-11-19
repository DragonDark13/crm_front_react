import React from 'react';
import {
    IEditProduct,
    INewProduct,
    INewSupplier,
    IProduct,
    IPurchaseData,
    ISaleData,
    ModalNames
} from "../../../utils/types";
import AddProductModal from "../../dialogs/productsDialogs/AddProductModal/AddProductModal";
import EditProductModal from "../../dialogs/productsDialogs/EditProductModal/EditProductModal";
import ProductHistoryModal from "../../dialogs/productsDialogs/ProductHistoryModal/ProductHistoryModal";
import PurchaseProductModal from "../../dialogs/productsDialogs/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "../../dialogs/productsDialogs/SaleProductModal/SaleProductModal";
import CreateNewCategoryModal from "../../dialogs/CreateNewCategoryModal/CreateNewCategoryModal";
import ConfirmDeleteModal from "../../dialogs/ConfirmDeleteModal/ConfirmDeleteModal";
import AddSupplierModal from "../../dialogs/AddSupplierModal/AddSupplierModal";
import ProductInfoModal from "../../dialogs/productsDialogs/ProductInfoModal";
import ProductInventoryModal from "../../dialogs/productsDialogs/ProductInventoryModal/ProductInventoryModal";

interface IProductsCatalogDialogsProps {
    isAuthenticated: boolean;
    modalState: Record<ModalNames, boolean>;
    handleModalClose: (modal: ModalNames) => void;
    handleAddProduct: () => void;
    handleCategoryChange: (categoryId: number[]) => void;
    handleRemoveCategory: (categoryId: number) => void;
    newProduct: INewProduct;
    setNewProduct: React.Dispatch<React.SetStateAction<INewProduct>>;
    selectedCategories: number[];
    infoProduct: IProduct | null;
    inventoryProduct: IProduct | null;
    setInventoryProduct: React.Dispatch<React.SetStateAction<IProduct | null>>;
    isLoading: boolean;
    handleSubmitInventory: (actualQuantity: number, reason: string) => Promise<void>;
    editProduct: IEditProduct | null;
    setEditProduct: React.Dispatch<React.SetStateAction<IEditProduct | null>>;
    handleEditSave: () => Promise<void>;
    productId: number | null;
    products: IProduct[];
    purchaseDetails: IPurchaseData;
    setPurchaseDetails: React.Dispatch<React.SetStateAction<IPurchaseData>>;
    handleSubmitPurchase: () => Promise<void>;
    saleData: ISaleData | null;
    setSaleData: React.Dispatch<React.SetStateAction<ISaleData | null>>;
    handleSale: () => Promise<void>;
    createNewCategory: (categoryName: string) => Promise<void>;
    selectedDeleteModalProductId: number | null;
    handleCloseDeleteModal: () => void;
    handleDelete: (productId: number) => Promise<void>;
    handleAddSupplier: (newSupplier: INewSupplier) => Promise<void>;
}

const ProductsCatalogDialogs: React.FC<IProductsCatalogDialogsProps> = ({
    isAuthenticated,
    modalState,
    handleModalClose,
    handleAddProduct,
    handleCategoryChange,
    handleRemoveCategory,
    newProduct,
    setNewProduct,
    selectedCategories,
    infoProduct,
    inventoryProduct,
    setInventoryProduct,
    isLoading,
    handleSubmitInventory,
    editProduct,
    setEditProduct,
    handleEditSave,
    productId,
    products,
    purchaseDetails,
    setPurchaseDetails,
    handleSubmitPurchase,
    saleData,
    setSaleData,
    handleSale,
    createNewCategory,
    selectedDeleteModalProductId,
    handleCloseDeleteModal,
    handleDelete,
    handleAddSupplier
}) => (
    <React.Fragment>
            {
                modalState.openAdd &&
                <AddProductModal
                    isAuthenticated={isAuthenticated}
                    handleRemoveCategory={handleRemoveCategory}
                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    openAdd={modalState.openAdd}
                    handleAdd={handleAddProduct}
                    handleCategoryChange={handleCategoryChange}
                    handleCloseAdd={() => handleModalClose("openAdd")}
                    selectedCategories={selectedCategories}/>
            }

            {(modalState.productInfoModal && infoProduct && !isLoading) &&
                <ProductInfoModal
                    product={infoProduct}
                    open={modalState.productInfoModal}
                    onClose={() => handleModalClose("productInfoModal")}/>
            }

            {inventoryProduct && (
                <ProductInventoryModal
                    product={inventoryProduct}
                    open={Boolean(inventoryProduct)}
                    onClose={() => setInventoryProduct(null)}
                    onSubmit={handleSubmitInventory}
                />
            )}

            {(modalState.openEdit && editProduct && !loadingState.isLoading) &&
                <EditProductModal
                    isAuthenticated={isAuthenticated}
                    openEdit={modalState.openEdit}
                    handleCloseEdit={() => handleModalClose("openEdit")}
                    editProduct={editProduct}
                    setEditProduct={setEditProduct} handleEditSave={handleEditSave}/>}


            {(modalState.openHistory && productId && products !== undefined) && (
                <ProductHistoryModal
                    productName={products.find(p => p.id === productId)?.name ?? '—'}
                    openHistory={modalState.openHistory}
                    onClose={() => handleModalClose("openHistory")}
                    productId={productId} // Передаємо productId
                />
            )}

            {(modalState.openPurchase && purchaseDetails && editProduct?.name) &&
                <PurchaseProductModal
                    isAuthenticated={isAuthenticated}
                    nameProduct={editProduct.name}
                    openPurchase={modalState.openPurchase}
                    handleClosePurchase={() => handleModalClose("openPurchase")}
                    purchaseDetails={purchaseDetails}
                    setPurchaseDetails={setPurchaseDetails}
                    handleSubmitPurchase={handleSubmitPurchase}/>}


            {
                (modalState.openSale && saleData && editProduct) &&
                <SaleProductModal
                    isAuthenticated={isAuthenticated}
                    nameProduct={editProduct.name}
                    purchasePricePerItem={editProduct.purchase_price_per_item}
                    quantityOnStock={editProduct.available_quantity}
                    openSale={modalState.openSale}
                    handleCloseSale={() => handleModalClose("openSale")}
                    saleData={saleData}
                    setSaleData={setSaleData}
                    handleSale={handleSale}
                />
            }

            {
                modalState.openCategoryCreate &&
                <CreateNewCategoryModal
                    isAuthenticated={isAuthenticated}
                    createNewCategory={createNewCategory}
                    openCategoryCreateModal={modalState.openCategoryCreate}
                    handleCloseCategoryModal={() => handleModalClose("openCategoryCreate")}
                />
            }

            {selectedDeleteModalProductId !== null && <ConfirmDeleteModal openConfirmDeleteModal={modalState.openDelete}
                                                                          handleCloseDeleteModal={handleCloseDeleteModal}
                                                                          selectedDeleteModalProductId={selectedDeleteModalProductId}
                                                                          handleDelete={handleDelete}/>}

            <AddSupplierModal
                isAuthenticated={isAuthenticated}
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleCloseAddSupplierModal={() => handleModalClose("openAddSupplierOpen")}
            />
    </React.Fragment>
);

export default ProductsCatalogDialogs;
