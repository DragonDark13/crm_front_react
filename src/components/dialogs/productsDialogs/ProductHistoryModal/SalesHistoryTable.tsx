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
    TableFooter, Button, Tooltip, IconButton
} from "@mui/material";
import {ICustomer} from "../../../../utils/types";
import {ProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";

interface SalesHistoryRecord {
    id: number;
    sale_date: string;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    customer: ICustomer;
}

interface SalesHistoryTableProps {
    onDeleteHistoryRecord: (historyType: string, historyId: number) => void;
    productHistory: ProductHistory[];
    sortByDate: (arr: ProductHistoryRecord[], field: string) => ProductHistoryRecord[];
    isAuthenticated: boolean
}

const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({
                                                                 productHistory,
                                                                 sortByDate,
                                                                 onDeleteHistoryRecord,
                                                                 isAuthenticated
                                                             }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <RenderHeaderCell>Дата</RenderHeaderCell>
                        <RenderHeaderCell>Клієнт</RenderHeaderCell>
                        <RenderHeaderCell>Ціна</RenderHeaderCell>
                        <RenderHeaderCell>Кількість проданих одиниць</RenderHeaderCell>
                        <RenderHeaderCell>Загальна ціна</RenderHeaderCell>
                        <RenderHeaderCell>Дії</RenderHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(productHistory.sales && productHistory.sales.length > 0) ?
                        sortByDate(productHistory.sales, 'sale_date').map((record) => (
                            <TableRow key={record.id + record.sale_date}>
                                <TableCell size={"small"}>{new Date(record.sale_date!).toLocaleString()}</TableCell>
                                <TableCell size={"small"}>{record.customer.name}</TableCell>
                                <TableCell size={"small"}>{record.selling_price_per_item}</TableCell>
                                <TableCell size={"small"}>{record.quantity_sold}</TableCell>
                                <TableCell size={"small"}>{record.selling_total_price}</TableCell>
                                <TableCell size={"small"}>
                                    <Tooltip title="Видалити">
                                       <span>
                                           <IconButton disabled={!isAuthenticated} color="error"
                                                       onClick={() => onDeleteHistoryRecord('sale', record.id)}>
                                                                                   <DeleteIcon fontSize="small"/>
                                                                               </IconButton>
                                       </span>
                                    </Tooltip>
                                    {/*<Button*/}
                                    {/*    color="secondary"*/}
                                    {/*    onClick={() => onDeleteHistoryRecord('sale', record.id)}*/}
                                    {/*>*/}
                                    {/*    Видалити*/}
                                    {/*</Button>*/}
                                </TableCell>

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
                                <Typography variant={"subtitle2"}>
                                    Загальна
                                    кількість:
                                </Typography>
                            </TableCell>
                            <TableCell size={"small"}>
                                <Typography
                                    variant={"subtitle2"}
                                    fontWeight={"bold"}>{productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0)}</Typography>
                            </TableCell>
                            <TableCell size={"small"}>
                                <Typography
                                    variant={"subtitle2"}
                                    fontWeight={"bold"}> {productHistory.sales.reduce((sum, record) => sum + record.selling_total_price, 0).toFixed(2)}</Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );
};

export default SalesHistoryTable;
