import React from 'react';
import {
    IEditProduct,
    INewProduct, INewSupplier,
    IProduct,
    IPurchaseData, ISaleData, IStateFilters,
    ModalNames
} from "../../utils/types";
import {
    Box,
    Button,
    CircularProgress,
    Drawer, Grid,
    IconButton,
    Snackbar,
    Typography
} from "@mui/material";
import FilterComponent from "../filters/FilterComponent/FilterComponent";
import ResponsiveProductView from "../ResponsiveProductView/ResponsiveProductView";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteAllProductsDialog from "../dialogs/productsDialogs/DeleteAllProductsDialog/DeleteAllProductsDialog";
import ProductsCatalogDialogs from "./ProductsCatalog/ProductsCatalogDialogs";
import {useProductsCatalog} from "../../hooks/useProductsCatalog";


export interface IProductsCatalogProps {
    products: IProduct[];
    isAuthenticated: boolean;
    showSnackbarMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
    lowQuantityProducts: IProduct[];
    modalState: Record<ModalNames, boolean>;
    setModalState: React.Dispatch<React.SetStateAction<Record<ModalNames, boolean>>>;
    order: 'asc' | 'desc';
    setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
    itemsPerPage: number;
    setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    sortProducts: (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => IProduct[];
    filters: IStateFilters;
    setFilters: React.Dispatch<React.SetStateAction<IStateFilters>>;
    orderBy: keyof IProduct;
    setOrderBy: React.Dispatch<React.SetStateAction<keyof IProduct>>;
    selectedLowProductId: number | null;
    setSelectedLowProductId: React.Dispatch<React.SetStateAction<number | null>>;
    filteredAndSearchedProducts: IProduct[];
    setFilteredAndSearchedProducts: React.Dispatch<React.SetStateAction<IProduct[]>>
    getComparator: (order: 'asc' | 'desc', orderBy: keyof IProduct) => (a: IProduct, b: IProduct) => number;
    getFieldValue: (product: IProduct, field: keyof IProduct) => string;
    searchTerm: string
    resetFilters: () => void;
    onRowRef?: (el: HTMLTableRowElement | null, index: number) => void;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const ProductsCatalog: React.FC<IProductsCatalogProps> = ({
                                                              currentPage,
                                                              setCurrentPage,
                                                              filteredAndSearchedProducts,
                                                              filters,
                                                              setFilters,
                                                              getComparator,
                                                              setFilteredAndSearchedProducts,
                                                              setItemsPerPage,
                                                              itemsPerPage
                                                              ,
                                                              lowQuantityProducts,
                                                              setModalState, modalState,
                                                              setOrder, order, setOrderBy, orderBy,
                                                              setSearchTerm,
                                                              searchTerm,
                                                              products,
                                                              isAuthenticated,
                                                              showSnackbarMessage,
                                                              sortProducts,
                                                              resetFilters,
                                                              onRowRef,
                                                              selectedLowProductId

                                                          }: IProductsCatalogProps) => {

    const {
        loadingState,
        filteredProducts,
        setFilteredProducts,
        newProduct,
        setNewProduct,
        editProduct,
        setEditProduct,
        infoProduct,
        inventoryProduct,
        setInventoryProduct,
        productId,
        purchaseDetails,
        setPurchaseDetails,
        saleData,
        setSaleData,
        selectedCategories,
        selectedDeleteModalProductId,
        handleModalOpen,
        handleModalClose,
        handleDeleteModalOpen,
        handleCloseDeleteModal,
        handleDelete,
        handleAddProduct,
        handleEditSave,
        handlePurchase,
        handleSubmitPurchase,
        handleSale,
        handleAddSupplier,
        handleOpenEdit,
        handleOpenProductInfoModal,
        handleSort,
        handleOpenSale,
        handleOpenHistoryModal,
        handleOpenInventory,
        handleSubmitInventory,
        handleCategoryChange,
        createNewCategory,
        handleExportToExcel,
        handleRemoveCategory
    } = useProductsCatalog({
        products,
        setModalState,
        order,
        setOrder,
        orderBy,
        setOrderBy,
        filteredAndSearchedProducts,
        setFilteredAndSearchedProducts,
        searchTerm,
        showSnackbarMessage
    });

// Обробник для зміни слайдера
    return (
        <React.Fragment>


            {loadingState.isLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                     height="100vh">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <CircularProgress/> {/* Прелоадер */}
                        <Typography variant="h6" sx={{mt: 2}}>
                            Loading...
                        </Typography>
                    </Box>
                </Box>
            ) : loadingState.error ? (
                <div>{loadingState.error}</div> // Відображення помилки
            ) : (
                <Box sx={{paddingTop: 1}}>
                    <Typography marginBlockEnd={3} variant={"h4"}>Список товарів</Typography>
                    <Grid container justifyContent={"space-between"}>
                        <Grid item>
                            <Button
                                startIcon={<FilterListIcon/>}
                                variant={"outlined"}
                                onClick={() => handleModalOpen("openDrawer")}>Фільтр</Button>
                        </Grid>
                        {isAuthenticated && <Grid item>
                            <DeleteAllProductsDialog/>
                        </Grid>
                        }
                        <Grid item>
                            <Button disabled={!isAuthenticated} variant={"contained"} onClick={handleExportToExcel}>Експортувати
                                в Excel</Button>
                        </Grid>
                    </Grid>
                    <Drawer classes={{
                        paper: "filter_container"
                    }} open={modalState.openDrawer} onClose={() => handleModalClose("openDrawer")}>
                        <Grid p={1} container>
                            <Grid item xs={12}>
                                <Button fullWidth endIcon={<CloseIcon/>} variant={"outlined"}
                                        onClick={() => handleModalClose("openDrawer")}>
                                    Закрити
                                </Button>
                            </Grid>
                        </Grid>
                        <FilterComponent
                            setFilteredProducts={setFilteredProducts}
                            filters={filters}
                            setFilters={setFilters}
                            filterArrayLength={filteredProducts.length}
                            resetFilters={resetFilters}/>
                    </Drawer>

                    <ResponsiveProductView
                        selectedLowProductId={selectedLowProductId}
                        filteredAndSearchedProducts={filteredAndSearchedProducts}
                        onRowRef={onRowRef}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        setCurrentPage={setCurrentPage}
                        setItemsPerPage={setItemsPerPage}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredProducts={filteredProducts}
                        order={order}
                        orderBy={orderBy}
                        handleSort={handleSort}
                        sortProducts={sortProducts}
                        getComparator={getComparator}
                        handleOpenEdit={handleOpenEdit}
                        handleOpenProductInfoModal={handleOpenProductInfoModal}
                        handleDelete={handleDeleteModalOpen}
                        handlePurchase={(product) => {
                            console.log('Purchase product:', product);
                            handlePurchase(product);
                        }}
                        handleOpenSale={(product) => {
                            console.log('Open sale for product:', product);
                            handleOpenSale(product);
                        }}
                        handleOpenHistoryModal={handleOpenHistoryModal}
                        handleOpenInventory={handleOpenInventory}
                    />

                    {/* Кнопка для відкриття модального вікна для додавання */}


                </Box>
            )}


            <ProductsCatalogDialogs
                isAuthenticated={isAuthenticated}
                modalState={modalState}
                handleModalClose={handleModalClose}
                handleAddProduct={handleAddProduct}
                handleCategoryChange={handleCategoryChange}
                handleRemoveCategory={handleRemoveCategory}
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                selectedCategories={selectedCategories}
                infoProduct={infoProduct}
                inventoryProduct={inventoryProduct}
                setInventoryProduct={setInventoryProduct}
                isLoading={loadingState.isLoading}
                handleSubmitInventory={handleSubmitInventory}
                editProduct={editProduct}
                setEditProduct={setEditProduct}
                handleEditSave={handleEditSave}
                productId={productId}
                products={products}
                purchaseDetails={purchaseDetails}
                setPurchaseDetails={setPurchaseDetails}
                handleSubmitPurchase={handleSubmitPurchase}
                saleData={saleData}
                setSaleData={setSaleData}
                handleSale={handleSale}
                createNewCategory={createNewCategory}
                selectedDeleteModalProductId={selectedDeleteModalProductId}
                handleCloseDeleteModal={handleCloseDeleteModal}
                handleDelete={handleDelete}
                handleAddSupplier={handleAddSupplier}
            />

            {/*<div style={{position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: "10px"}}>*/}
            {/*    {lowQuantityProducts.length > 0 && (*/}
            {/*        <IconButton*/}
            {/*            onClick={() => handleModalOpen("openNotificationDrawer")}*/}
            {/*            title={`Low quantity products: ${lowQuantityProducts.length}`} // Tooltip for low quantity products*/}
            {/*        >*/}
            {/*            <Badge badgeContent={lowQuantityProducts.length} color="error">*/}
            {/*                <NotificationImportantIcon/>*/}
            {/*            </Badge>*/}
            {/*        </IconButton>*/}
            {/*    )}*/}
            {/*    {isAuthenticated ? (*/}
            {/*        <Button variant={"text"} onClick={handleLogout} title="Logout" endIcon={<ExitToAppIcon/>}>*/}
            {/*            Вийти*/}
            {/*        </Button>*/}
            {/*    ) : (*/}
            {/*        <Button*/}
            {/*            variant={"text"}*/}
            {/*            onClick={() => navigate('/crm_front_react/login')}*/}
            {/*            title="Login"*/}
            {/*            endIcon={<LoginIcon/>}*/}
            {/*        >*/}
            {/*            Увійти*/}
            {/*        </Button>*/}
            {/*    )}*/}
            {/*</div>*/}


            {/* Drawer Component */}
            {/*<Drawer classes={{*/}
            {/*    paper: "filter_container"*/}
            {/*}} anchor="right" open={modalState.openNotificationDrawer}*/}

            {/*        onClose={() => handleModalClose("openNotificationDrawer")}>*/}
            {/*    <Grid p={1} container>*/}
            {/*        <Grid item xs={12}>*/}
            {/*            <Button fullWidth endIcon={<CloseIcon/>} variant={"outlined"}*/}
            {/*                    onClick={() => handleModalClose("openNotificationDrawer")}>*/}
            {/*                Закрити*/}
            {/*            </Button></Grid>*/}
            {/*    </Grid>*/}
            {/*    <NotificationPanel handleListItemClick={handleListItemClick} lowQuantityProducts={lowQuantityProducts}/>*/}
            {/*</Drawer>*/}


            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                sx={{marginTop: 4}}
                open={modalState.snackbarNotifyOpen}
                autoHideDuration={1000}
                onClose={() => handleModalClose("snackbarNotifyOpen")}
                message={`${lowQuantityProducts.length} товарів з низькою кількістю`}
                action={
                    <IconButton size="small" aria-label="close" color="inherit"
                                onClick={() => handleModalClose("snackbarNotifyOpen")}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                }
            />

        </React.Fragment>

    );
};

export default ProductsCatalog;
