import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableFooter,
    Typography
} from "@mui/material";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";

interface CombinedHistoryRecord {
    id: number;
    date: string;
    type: string;
    quantity: number;
    price: number;
    total: number;
}

interface CombinedHistoryTableProps {
    productHistory: ProductHistory[];
}

const CombinedHistoryTable = ({productHistory}: CombinedHistoryTableProps) => {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Контрагент</TableCell>
                        <TableCell>Ціна</TableCell>
                        <TableCell>Кількість</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {((productHistory && productHistory.purchase && productHistory.purchase.length > 0) || (productHistory.sales && productHistory.sales.length > 0)) ? (
                            // Об'єднання та сортування закупівель і продажів
                            [...productHistory.purchase.map(record => ({...record, type: 'purchase'})),
                                ...productHistory.sales.map(record => ({...record, type: 'sale'}))]
                                .sort((a, b) => {
                                    const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
                                    const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;

                                    const dateSaleA = a.sale_date ? new Date(a.sale_date).getTime() : 0;
                                    const dateSaleB = b.sale_date ? new Date(b.sale_date).getTime() : 0;

                                    const finalDateA = dateA || dateSaleA;  // Якщо є дата закупівлі, використовується вона, інакше дата продажу
                                    const finalDateB = dateB || dateSaleB;  // Те саме для другого запису

                                    return finalDateA - finalDateB;
                                }).map((record, index) => (
                                <TableRow
                                    key={record.id + index + record.type}
                                    style={{backgroundColor: record.type === 'sale' ? '#d1e7dd' : '#f8d7da'}} // Колір для продажу і закупки
                                >
                                    <TableCell>{new Date(record.purchase_date || record.sale_date!).toLocaleString()}</TableCell>
                                    <TableCell>{record.type === 'sale' ? 'Продаж' : 'Закупка'}</TableCell>
                                    <TableCell>{record.type === 'sale' ? record.customer.name : record.supplier.name}</TableCell>
                                    <TableCell>{record.type === 'sale' ? record.selling_price_per_item : record.purchase_price_per_item}</TableCell>
                                    <TableCell>{record.type === 'sale' ? record.quantity_sold : record.quantity_purchase}</TableCell>
                                    <TableCell>{record.type === 'sale' ? record.selling_price_per_item : record.purchase_total_price}</TableCell>
                                </TableRow>
                            ))
                        )
                        : <TableRow>
                            <TableCell colSpan={6}>Немає жодного запису в журналі.</TableCell>
                        </TableRow>}
                </TableBody>
                {productHistory && productHistory.purchase && productHistory.purchase.length > 0 && productHistory.sales && productHistory.sales.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={4} align="right">
                                <strong>Загальна кількість продажів:</strong>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0)}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.selling_total_price, 0).toFixed(2)}</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={4} align="right">
                                <strong>Загальна кількість закупок:</strong>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}>{productHistory.purchase.reduce((sum, record) => sum + record.quantity_purchase, 0)}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}>{productHistory.purchase.reduce((sum, record) => sum + parseFloat(String(record.purchase_total_price)) || 0, 0).toFixed(2)}</Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );
}

export default CombinedHistoryTable;
