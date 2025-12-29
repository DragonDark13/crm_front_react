import React, {useState} from "react";
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
import {ICustomer, IonDeleteHistoryRecord} from "../../../../utils/types";
import {IProductSaleHistoryRecord, IProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";
import {useSnackbarMessage} from "../../../Provider/SnackbarMessageContext";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";


interface SalesHistoryTableProps {
    onDeleteHistoryRecord: (params: IonDeleteHistoryRecord) => void;
    productHistory: IProductHistory;
    sortByDate: (arr: IProductSaleHistoryRecord[], field: string) => IProductSaleHistoryRecord[];
    isAuthenticated: boolean
    refreshHistory: () => void;

}

const SalesHistoryTable: React.FC<SalesHistoryTableProps> =
    ({
         productHistory,
         sortByDate,
         onDeleteHistoryRecord,
         isAuthenticated,
         refreshHistory
     }) => {
        const {showSnackbarMessage} = useSnackbarMessage()

        const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
        const [recordToDelete, setRecordToDelete] = useState<null | IProductSaleHistoryRecord>(null);

        const handleDeleteClick = (record: IProductSaleHistoryRecord) => {
            setRecordToDelete(record);
            if (recordToDelete !== null) {

                setOpenConfirmDialog(true);


            }

        };

        const totalPurchased = productHistory.purchase.reduce((sum, record) => sum + record.quantity_purchase, 0);
        const totalSold = productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0);

        const currentStock = totalPurchased - totalSold;

        console.log('currentStock:', currentStock);

        return (
            <React.Fragment>
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
                                        <TableCell
                                            size={"small"}>{new Date(record.sale_date!).toLocaleString()}</TableCell>
                                        <TableCell size={"small"}>{record.customer.name}</TableCell>
                                        <TableCell size={"small"}>{record.selling_price_per_item}</TableCell>
                                        <TableCell size={"small"}>{record.quantity_sold}</TableCell>
                                        <TableCell size={"small"}>{record.selling_total_price}</TableCell>
                                        <TableCell size={"small"}>
                                            <Tooltip title="Видалити">
                                       <span>
                                           <IconButton disabled={!isAuthenticated}
                                                       color="error"
                                                       onClick={() => handleDeleteClick(record)}>
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
                <ConfirmDeleteDialog
                    open={openConfirmDialog}
                    handleClose={() => setOpenConfirmDialog(false)}
                    record={recordToDelete}
                    type={'sale'} // 'purchase' або 'sale'
                    onConfirm={async () => {
                        if (recordToDelete) {
                            try {
                                await onDeleteHistoryRecord({
                                    productId: recordToDelete.product_id,
                                    historyType: 'sale',
                                    historyId: recordToDelete.id
                                });

                                await refreshHistory(); // чекаємо оновлення після видалення
                            } catch (error) {
                                console.error("Помилка при видаленні:", error);
                            }
                        }
                        setOpenConfirmDialog(false);
                    }}
                />
            </React.Fragment>

        );
    };

export default SalesHistoryTable;
