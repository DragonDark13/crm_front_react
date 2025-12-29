import React, {useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableFooter,
    Typography, Button, IconButton, Tooltip, Box, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {IonDeleteHistoryRecord, ISupplierFull} from "../../../../utils/types";
import {IProductPurchaseHistoryRecord, IProductHistory, ProductHistoryRecord} from "./ProductHistoryModal";
import DeleteIcon from "@mui/icons-material/Delete";
import {useAuth} from "../../../context/AuthContext";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";
import CustomDialog from "../../CustomDialog/CustomDialog";
import CancelButton from "../../../Buttons/CancelButton";
import {useSnackbarMessage} from "../../../Provider/SnackbarMessageContext";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface PurchaseHistoryRecord {
    id: number;
    purchase_date: string;
    quantity_purchase: number;
    purchase_price_per_item: number;
    purchase_total_price: number;
    supplier: ISupplierFull;
}


interface PurchaseHistoryTableProps {
    onDeleteHistoryRecord: (params: IonDeleteHistoryRecord) => void;
    productHistory: IProductHistory;
    sortByDate: (arr: IProductPurchaseHistoryRecord[], field: string) => IProductPurchaseHistoryRecord[];
    isAuthenticated: boolean
    refreshHistory: () => void;
}

const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> =
    ({
         productHistory,
         sortByDate,
         onDeleteHistoryRecord,
         isAuthenticated,
         refreshHistory
     }) => {
        const {showSnackbarMessage} = useSnackbarMessage()

        const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
        const [recordToDelete, setRecordToDelete] = useState<null | IProductPurchaseHistoryRecord>(null);

        const handleDeleteClick = (record: IProductPurchaseHistoryRecord) => {
            setRecordToDelete(record);
            if (recordToDelete !== null) {
                const newStock = (totalPurchased - recordToDelete.quantity_purchase) - totalSold;
                if (newStock < 0) {
                    showSnackbarMessage("Неможливо видалити: залишок стане від'ємним! " +
                        `Видаліть попередньо не менше ${recordToDelete.quantity_purchase - totalSold}шт з історії продажів`, "error");
                    return;
                } else {
                    setOpenConfirmDialog(true);

                }

            }

        };

        const totalPurchased = productHistory.purchase.reduce((sum, record) => sum + record.quantity_purchase, 0);
        const totalSold = productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0);

        const currentStock = totalPurchased - totalSold;

        console.log('productHistory.purchase:', productHistory.purchase);

        return (
            <React.Fragment>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <RenderHeaderCell>Дата</RenderHeaderCell>
                                <RenderHeaderCell>Постачальник</RenderHeaderCell>
                                <RenderHeaderCell>Ціна за одиницю</RenderHeaderCell>
                                <RenderHeaderCell>Кількість закупівлі</RenderHeaderCell>
                                <RenderHeaderCell>Загальна ціна</RenderHeaderCell>
                                <RenderHeaderCell align={"right"}>Дії</RenderHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(productHistory.purchase && productHistory.purchase.length > 0) ?
                                sortByDate(productHistory.purchase, 'purchase_date').map((record) => (
                                    <TableRow key={record.id + record.purchase_date}>
                                        <TableCell
                                            size={"small"}>{new Date(record.purchase_date!).toLocaleString()}</TableCell>
                                        <TableCell  size={"small"}>
                                        <Typography color={  !record.supplier.is_active ? 'textDisabled' :'inherit'}>
                                           {!record.supplier.is_active && "не активний"}  {record.supplier.name}
                                        </Typography>


                                        </TableCell>
                                        <TableCell size={"small"}>{record.purchase_price_per_item}</TableCell>
                                        <TableCell size={"small"}>{record.quantity_purchase}</TableCell>
                                        <TableCell size={"small"}>{record.purchase_total_price}</TableCell>
                                        <TableCell size={"small"} align={"right"}>
                                            <Tooltip title="Видалити">

                                        <span>     <IconButton disabled={!isAuthenticated} color="error"
                                                               onClick={() => handleDeleteClick(record)}><DeleteIcon
                                            fontSize="small"/></IconButton></span>
                                            </Tooltip>

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
                                    <TableCell colSpan={3} align="right">
                                        <Typography variant={"subtitle2"}>Загальна
                                            кількість:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={"bold"}
                                                    variant={"subtitle2"}> {productHistory.purchase.reduce((sum, record) => sum + (record.quantity_purchase || 0), 0)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant={"subtitle2"} fontWeight={"bold"}>  {productHistory.purchase
                                            .reduce((sum, record) => sum + parseFloat(String(record.purchase_total_price)) || 0, 0)
                                            .toFixed(2)}</Typography>
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
                    type={'purchase'} // 'purchase' або 'sale'
                    onConfirm={() => {
                        if (recordToDelete) {
                            try {
                                onDeleteHistoryRecord({
                                    productId: recordToDelete.product_id,
                                    historyType: 'purchase',
                                    historyId: recordToDelete.id
                                });
                                refreshHistory();
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

export default PurchaseHistoryTable;
