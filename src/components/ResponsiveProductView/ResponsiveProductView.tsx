import React, {forwardRef} from 'react';
import {useTheme} from '@mui/material/styles';
import {Grid, TablePagination, TextField, useMediaQuery} from '@mui/material';
import {IProduct} from "../../utils/types";
import ProductCardView from "../ProductCardView/ProductCardView";
import ProductTable from "../ProductTable/ProductTable";

interface IResponsiveProductViewProps {
    filteredProducts: IProduct[];
    order: 'asc' | 'desc';
    orderBy: keyof IProduct;
    handleSort: (property: keyof IProduct) => void;
    sortProducts: (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => IProduct[];
    getComparator: (order: 'asc' | 'desc', orderBy: keyof IProduct) => (a: IProduct, b: IProduct) => number;
    handleOpenEdit: (product: IProduct) => void;
    handleDelete: (productId: number) => void;
    handleOpenHistoryModal: (productId: number) => void;
    handlePurchase: (product: IProduct) => void;
    handleOpenSale: (product: IProduct) => void;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    currentPage: number;
    itemsPerPage: number;
    setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
    filteredAndSearchedProducts: IProduct[];
}

const ResponsiveProductView: React.FC<IResponsiveProductViewProps> = forwardRef(({
                                                                          filteredProducts,
                                                                          order,
                                                                          orderBy,
                                                                          handleSort,
                                                                          sortProducts,
                                                                          getComparator,
                                                                          handleOpenEdit,
                                                                          handleDelete,
                                                                          handlePurchase,
                                                                          handleOpenSale,
                                                                          handleOpenHistoryModal,
                                                                          searchTerm,
                                                                          setSearchTerm,
                                                                          setCurrentPage,
                                                                          currentPage,
                                                                          itemsPerPage,
                                                                          setItemsPerPage,
    filteredAndSearchedProducts
                                                                      },ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



    return (
        <React.Fragment>
            <Grid container justifyContent={"flex-end"}>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Пошук товару"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid>

            </Grid>

            {isMobile ? (
                <ProductCardView
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    searchTerm={searchTerm}
                    filteredAndSearchedProducts={filteredAndSearchedProducts}
                    filteredProducts={filteredProducts}
                    order={order}
                    orderBy={orderBy}
                    handleSort={handleSort}
                    sortProducts={sortProducts}
                    getComparator={getComparator}
                    handleOpenEdit={handleOpenEdit}
                    handleDelete={handleDelete}
                    handlePurchase={handlePurchase}
                    handleOpenSale={handleOpenSale}
                    handleOpenHistoryModal={handleOpenHistoryModal}
                />
            ) : (
                <ProductTable
                    ref={ref}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    searchTerm={searchTerm}
                    filteredAndSearchedProducts={filteredAndSearchedProducts}
                    filteredProducts={filteredProducts}
                    order={order}
                    orderBy={orderBy}
                    handleSort={handleSort}
                    sortProducts={sortProducts}
                    getComparator={getComparator}
                    handleOpenEdit={handleOpenEdit}
                    handleDelete={handleDelete}
                    handlePurchase={handlePurchase}
                    handleOpenSale={handleOpenSale}
                    handleOpenHistoryModal={handleOpenHistoryModal}
                />
            )}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAndSearchedProducts.length}
                rowsPerPage={itemsPerPage}
                page={currentPage}
                onPageChange={(event, newPage) => setCurrentPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setItemsPerPage(parseInt(event.target.value, 10));
                    setCurrentPage(0); // Скидаємо на першу сторінку
                }}
            />

        </React.Fragment>
    );
});

export default ResponsiveProductView;
