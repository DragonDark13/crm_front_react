import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { ISupplier } from "../../../utils/types";

interface PurchaseHistoryRecord {
    id: number;
    purchase_date: string;
    quantity_purchase: number;
    purchase_price_per_item: number;
    purchase_total_price: number;
    supplier: ISupplier;
}

interface PurchaseHistoryTableProps {
    purchaseHistory: PurchaseHistoryRecord[];
}

const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> = ({ purchaseHistory }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата закупівлі</TableCell>
                        <TableCell>Постачальник</TableCell>
                        <TableCell>Кількість</TableCell>
                        <TableCell>Ціна за одиницю</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {purchaseHistory.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.purchase_date}</TableCell>
                            <TableCell>{record.supplier.name}</TableCell>
                            <TableCell>{record.quantity_purchase}</TableCell>
                            <TableCell>{record.purchase_price_per_item}</TableCell>
                            <TableCell>{record.purchase_total_price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PurchaseHistoryTable;
