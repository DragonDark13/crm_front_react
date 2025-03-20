import React from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";

interface StockHistoryRecord {
    id: number;
    timestamp: string;
    change_type: string;
    change_amount: number;
}

interface StockHistoryTableProps {
    productHistory: ProductHistory[];
    sortByDate: (arr: ProductHistoryRecord[], field: string) => ProductHistoryRecord[];
}

const StockHistoryTable: React.FC<StockHistoryTableProps> = ({productHistory, sortByDate}) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Тип зміни</TableCell>
                        <TableCell>Зміни по Кількості</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(productHistory.stock && productHistory.stock.length > 0) ?
                    sortByDate(productHistory.stock, 'timestamp').map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{new Date(record.timestamp!).toLocaleString()}</TableCell>
                            <TableCell>{record.change_type}</TableCell>
                            <TableCell>{record.change_amount}</TableCell>
                        </TableRow>
                    ))
                        : (
                            <TableRow>
                                <TableCell colSpan={3}>Немає змін в журналі.</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StockHistoryTable;
