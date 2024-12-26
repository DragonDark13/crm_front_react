import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

interface CombinedHistoryRecord {
    id: number;
    date: string;
    type: string;
    quantity: number;
    price: number;
    total: number;
}

interface CombinedHistoryTableProps {
    purchaseHistory: CombinedHistoryRecord[];
    salesHistory: CombinedHistoryRecord[];
}

const CombinedHistoryTable: React.FC<CombinedHistoryTableProps> = ({ purchaseHistory, salesHistory }) => {
    const combinedHistory = [
        ...purchaseHistory.map((item) => ({ ...item, type: "Закупівля" })),
        ...salesHistory.map((item) => ({ ...item, type: "Продаж" })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Кількість</TableCell>
                        <TableCell>Ціна за одиницю</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {combinedHistory.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.type}</TableCell>
                            <TableCell>{record.quantity}</TableCell>
                            <TableCell>{record.price}</TableCell>
                            <TableCell>{record.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CombinedHistoryTable;
