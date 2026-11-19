import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';

interface ProductPurchase {
    product: string;
    quantity_purchase: number;
    purchase_price_per_item: number;
    purchase_total_price: number;
    purchase_date: string;
}

interface PackagingPurchase {
    material: string | null;
    quantity_purchased: number;
    purchase_price_per_unit: number;
    purchase_total_price: number;
    purchase_date: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface Props {
    supplierId: number;
    suppliers: Supplier[];
    type?: 'product' | 'packaging';
    purchaseHistory: (ProductPurchase | PackagingPurchase)[];
}

const SupplierPurchaseHistoryTable: React.FC<Props> = ({ supplierId, suppliers, type='product', purchaseHistory }) => {
    const supplier = suppliers.find((s) => s.id === supplierId);

    return (
        <TableContainer>
            <Table size="small" sx={{ marginTop: 2 }}>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={5}>
                            <Typography variant="h6">
                                Історія постачань:
                                <span> {supplier?.name || 'Невідомий постачальник'}</span>
                            </Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Дата закупівлі</TableCell>
                        <TableCell>{type === 'product' ? 'Товар' : 'Матеріал'}</TableCell>
                        <TableCell>Кількість</TableCell>
                        <TableCell>Ціна за одиницю</TableCell>
                        <TableCell>Загальна вартість</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {purchaseHistory.length > 0 ? (
                        purchaseHistory.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(item.purchase_date).toLocaleDateString('uk-UA')}</TableCell>
                                <TableCell>{type === 'product' ? (item as ProductPurchase).product : (item as PackagingPurchase).material ?? '—'}</TableCell>
                                <TableCell>{type === 'product' ? (item as ProductPurchase).quantity_purchase : (item as PackagingPurchase).quantity_purchased}</TableCell>
                                <TableCell>{type === 'product' ? (item as ProductPurchase).purchase_price_per_item : (item as PackagingPurchase).purchase_price_per_unit}</TableCell>
                                <TableCell>{item.purchase_total_price}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">Даних немає</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SupplierPurchaseHistoryTable;
