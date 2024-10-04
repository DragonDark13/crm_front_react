import React from 'react';
import { useTheme } from '@mui/material/styles';
import {useMediaQuery} from '@mui/material';
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
}

const ResponsiveProductView: React.FC<IResponsiveProductViewProps> = ({
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
                                                                          handleOpenHistoryModal
                                                                      }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            {isMobile ? (
                <ProductCardView
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
        </>
    );
};

export default ResponsiveProductView;
