import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TableFooter
} from "@mui/material";
import {ICustomer} from "../../../utils/types";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";

interface SalesHistoryRecord {
    id: number;
    sale_date: string;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    customer: ICustomer;
}

interface SalesHistoryTableProps {
    productHistory: ProductHistory[];
    sortByDate: (arr: ProductHistoryRecord[], field: string) => ProductHistoryRecord[];
}

const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({productHistory, sortByDate}) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Клієнт</TableCell>
                        <TableCell>Ціна</TableCell>
                        <TableCell>Кількість проданих одиниць</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(productHistory.sales && productHistory.sales.length > 0) ?
                    sortByDate(productHistory.sales, 'sale_date').map((record) => (
                        <TableRow key={record.id + record.sale_date}>
                            <TableCell>{new Date(record.sale_date!).toLocaleString()}</TableCell>
                            <TableCell>{record.customer.name}</TableCell>
                            <TableCell>{record.selling_price_per_item}</TableCell>
                            <TableCell>{record.quantity_sold}</TableCell>
                            <TableCell>{record.selling_total_price}</TableCell>
                        </TableRow>
                    ))
                        : (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography>Немає Історії продажів.</Typography>
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
                {productHistory.sales && productHistory.sales.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <Typography>
                                    Загальна
                                    кількість:
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0)}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}> {productHistory.sales.reduce((sum, record) => sum + record.selling_total_price, 0).toFixed(2)}</Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );
};

export default SalesHistoryTable;
