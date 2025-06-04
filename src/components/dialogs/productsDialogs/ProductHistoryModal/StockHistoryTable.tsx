import React from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";

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
                        <RenderHeaderCell>Дата</RenderHeaderCell>
                        <RenderHeaderCell>Тип зміни</RenderHeaderCell>
                        <RenderHeaderCell>Зміни по Кількості</RenderHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(productHistory.stock && productHistory.stock.length > 0) ?
                    sortByDate(productHistory.stock, 'timestamp').map((record) => (
                        <TableRow key={record.id}>
                            <TableCell size={"small"}>{new Date(record.timestamp!).toLocaleString()}</TableCell>
                            <TableCell size={"small"}>{record.change_type}</TableCell>
                            <TableCell size={"small"}>{record.change_amount}</TableCell>
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
