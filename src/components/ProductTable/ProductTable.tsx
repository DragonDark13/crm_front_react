// ProductTable.tsx

import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, TableSortLabel,
} from '@mui/material';
import {IProduct} from "../../App";

interface IProductTableProps {
    filteredProducts: IProduct[];
    order: 'asc' | 'desc';
    orderBy: keyof IProduct;
    handleSort: (property: keyof IProduct) => void;
    sortProducts: (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => IProduct[];
    getComparator: (order: 'asc' | 'desc', orderBy: keyof IProduct) => (a: IProduct, b: IProduct) => number;
    handleOpenEdit: (product: IProduct) => void;
    handleDelete: (productId: number) => void;
    handlePurchase: (product: IProduct) => void;
    handleOpenSale: (product: IProduct) => void;
    setProductId: (id: number | null) => void;
    setOpenHistory: (open: boolean) => void;
}

const ProductTable: React.FC<IProductTableProps> = ({
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
    setProductId,
    setOpenHistory
}) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'name'}
                                direction={orderBy === 'name' ? order : 'asc'}
                                onClick={() => handleSort('name')}
                            >
                                Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'quantity'}
                                direction={orderBy === 'quantity' ? order : 'asc'}
                                onClick={() => handleSort('quantity')}
                            >
                                Quantity
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'total_price'}
                                direction={orderBy === 'total_price' ? order : 'asc'}
                                onClick={() => handleSort('total_price')}
                            >
                                Total Price
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'price_per_item'}
                                direction={orderBy === 'price_per_item' ? order : 'asc'}
                                onClick={() => handleSort('price_per_item')}
                            >
                                Price per Item
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredProducts.length > 0 && sortProducts(filteredProducts, getComparator(order, orderBy)).map((product: IProduct, index) => (
                        <TableRow key={`${product.id}${index}`}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.supplier}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{product.total_price}</TableCell>
                            <TableCell>{product.price_per_item}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary"
                                        onClick={() => handleOpenEdit(product)}>
                                    Edit
                                </Button>
                                <Button variant="contained" color="secondary"
                                        onClick={() => handleDelete(product.id)}>
                                    Delete
                                </Button>
                                <Button variant="contained" color="primary"
                                        onClick={() => handlePurchase(product)}>
                                    Purchase
                                </Button>
                                <Button variant="contained" color="primary"
                                        onClick={() => handleOpenSale(product)}>
                                    Sale
                                </Button>
                                <Button variant="contained" onClick={() => {
                                    setProductId(product.id); // Встановлюємо productId
                                    setOpenHistory(true); // Відкриваємо модальне вікно
                                }}>
                                    History
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProductTable;
