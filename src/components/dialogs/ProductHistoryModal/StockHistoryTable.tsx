import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

interface StockHistoryRecord {
    id: number;
    timestamp: string;
    change_type: string;
    change_amount: number;
}

interface StockHistoryTableProps {
    stockHistory: StockHistoryRecord[];
}

const StockHistoryTable: React.FC<StockHistoryTableProps> = ({ stockHistory }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата та час</TableCell>
                        <TableCell>Тип зміни</TableCell>
                        <TableCell>Кількість</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stockHistory.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.timestamp}</TableCell>
                            <TableCell>{record.change_type}</TableCell>
                            <TableCell>{record.change_amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StockHistoryTable;
