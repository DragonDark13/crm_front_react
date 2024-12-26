import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { ICustomer } from "../../../utils/types";

interface SalesHistoryRecord {
    id: number;
    sale_date: string;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    customer: ICustomer;
}

interface SalesHistoryTableProps {
    salesHistory: SalesHistoryRecord[];
}

const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({ salesHistory }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата продажу</TableCell>
                        <TableCell>Клієнт</TableCell>
                        <TableCell>Кількість</TableCell>
                        <TableCell>Ціна за одиницю</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {salesHistory.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.sale_date}</TableCell>
                            <TableCell>{record.customer.name}</TableCell>
                            <TableCell>{record.quantity_sold}</TableCell>
                            <TableCell>{record.selling_price_per_item}</TableCell>
                            <TableCell>{record.selling_total_price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SalesHistoryTable;
