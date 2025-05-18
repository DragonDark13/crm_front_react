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
    Typography, Button, IconButton
} from "@mui/material";
import {ISupplierFull} from "../../../../utils/types";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import {useAuth} from "../../../context/AuthContext";

interface PurchaseHistoryRecord {
    id: number;
    purchase_date: string;
    quantity_purchase: number;
    purchase_price_per_item: number;
    purchase_total_price: number;
    supplier: ISupplierFull;
}


interface PurchaseHistoryTableProps {
    onDeleteHistoryRecord: (historyType: string, historyId: number) => void;
    productHistory: ProductHistory[];
    sortByDate: (arr: ProductHistoryRecord[], field: string) => ProductHistoryRecord[];
}

const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> = ({
                                                                       productHistory,
                                                                       sortByDate,
                                                                       onDeleteHistoryRecord
                                                                   }) => {
    const {isAuthenticated} = useAuth();

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Постачальник</TableCell>
                        <TableCell>Ціна за одиницю</TableCell>
                        <TableCell>Кількість закупівлі</TableCell>
                        <TableCell>Загальна ціна</TableCell>
                        <TableCell align={"right"}>Дії</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {(productHistory.purchase && productHistory.purchase.length > 0) ?
                        sortByDate(productHistory.purchase, 'purchase_date').map((record) => (
                            <TableRow key={record.id + record.purchase_date}>
                                <TableCell>{new Date(record.purchase_date!).toLocaleString()}</TableCell>
                                <TableCell>{record.supplier.name}</TableCell>
                                <TableCell>{record.purchase_price_per_item}</TableCell>
                                <TableCell>{record.quantity_purchase}</TableCell>
                                <TableCell>{record.purchase_total_price}</TableCell>
                                <TableCell align={"right"}>
                                    <IconButton disabled={!isAuthenticated} color="error"
                                                onClick={() => onDeleteHistoryRecord('purchase', record.id)}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>

                                </TableCell>
                            </TableRow>
                        ))
                        : (
                            <TableRow>
                                <TableCell colSpan={5}>Немає даних про історію товару.</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
                {productHistory.purchase && productHistory.purchase.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} align="right"><strong>Загальна
                                кількість:</strong></TableCell>
                            <TableCell>
                                <Typography
                                    variant={"subtitle2"}> {productHistory.purchase.reduce((sum, record) => sum + (record.quantity_purchase || 0), 0)}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant={"subtitle2"}>  {productHistory.purchase
                                    .reduce((sum, record) => sum + parseFloat(String(record.purchase_total_price)) || 0, 0)
                                    .toFixed(2)}</Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );
};

export default PurchaseHistoryTable;
