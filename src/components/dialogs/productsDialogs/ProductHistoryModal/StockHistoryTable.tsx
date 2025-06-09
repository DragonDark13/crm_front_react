import React from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";
import {IStockHistoryRecord, ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";


interface StockHistoryTableProps {
    productHistory: ProductHistory;
    sortByDate: (arr: IStockHistoryRecord[], field: string) => IStockHistoryRecord[];
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
