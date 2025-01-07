import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';

interface MaterialHistoryItem {
    date: string;
    description: string;
    quantity: number;
}

interface IMaterialHistoryTable {
    materialHistory: MaterialHistoryItem[];
}


const MaterialHistoryTable = ({materialHistory}: IMaterialHistoryTable) => {
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
                            <TableCell>{new Date(historyItem.date).toLocaleDateString()}</TableCell>
                            <TableCell>{historyItem.description}</TableCell>
                            <TableCell>{historyItem.quantity}</TableCell>
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
