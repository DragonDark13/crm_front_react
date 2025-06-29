import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import {IMaterialSupplier} from "../../../../utils/types";

interface MaterialHistoryItem {
    date: string;
    description: string;
    quantity: number;
}

interface IMaterialHistoryTable {
    materialHistory: MaterialHistoryItem[];
        selectedSupplierData: IMaterialSupplier

}


const MaterialHistoryTable = ({materialHistory,selectedSupplierData}: IMaterialHistoryTable) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Опис</TableCell>
                    <TableCell>Кількість</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {materialHistory.length > 0 ? (
                    materialHistory.map((historyItem, index) => (
                        <TableRow key={index}>
                            <TableCell size={"small"}>{new Date(historyItem.date).toLocaleDateString()}</TableCell>
                            <TableCell size={"small"}>{historyItem.description}</TableCell>
                            <TableCell size={"small"}>{historyItem.quantity}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3}>Немає історії для цього пакування.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default MaterialHistoryTable;
